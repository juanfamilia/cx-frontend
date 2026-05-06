import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';

import {
  DoobloCompanyConfig,
  FieldService,
  QualtricsCompanyConfig,
} from './field.service';
import { FieldPrimaryNavTabsComponent } from './components/field-primary-nav-tabs.component';
import { companyDisplayLabel } from './field-company.helpers';
import { FieldTenantContextService } from './field-tenant-context.service';

export type FieldConnectorTabId = 'dooblo' | 'qualtrics' | 'csv';

@Component({
  selector: 'app-field-connector-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FieldPrimaryNavTabsComponent],
  templateUrl: './field-connector-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldConnectorHubComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tenantCtx = inject(FieldTenantContextService);

  readonly companyDisplayLabel = companyDisplayLabel;

  readonly user = this.auth.getCurrentUser();
  readonly isSuperAdmin = this.user.role === 0;

  readonly companies = signal<Company[]>([]);

  readonly activeConnector = signal<FieldConnectorTabId>('dooblo');

  readonly doobloCompanyContext = signal<DoobloCompanyConfig | null>(null);
  readonly doobloCredentialsLoading = signal(false);
  readonly doobloFormBaseUrl = signal('');
  readonly doobloFormApiUser = signal('');
  readonly doobloFormPassword = signal('');
  readonly doobloActionBusy = signal(false);

  readonly qualtricsCompanyContext = signal<QualtricsCompanyConfig | null>(null);
  readonly qualtricsCredentialsLoading = signal(false);
  readonly qualtricsFormBaseUrl = signal('');
  readonly qualtricsFormApiToken = signal('');
  readonly qualtricsActionBusy = signal(false);
  readonly qualtricsProbeBusy = signal(false);

  /** Si ya hay credenciales, el formulario queda plegado hasta que el usuario elija editar. */
  readonly doobloCredentialFormOpen = signal(true);
  readonly qualtricsCredentialFormOpen = signal(true);

  private static readonly companyListLimit = 100;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = (params.get('tab') ?? '').trim().toLowerCase();
      if (tab === 'qualtrics' || tab === 'csv' || tab === 'dooblo') {
        this.activeConnector.set(tab as FieldConnectorTabId);
      }
    });

    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, FieldConnectorHubComponent.companyListLimit).subscribe({
        next: res => {
          this.companies.set(res.data);
          let sid = this.tenantCtx.selectedCompanyId();
          if (sid == null || !res.data.some(c => c.id === sid)) {
            sid = res.data[0]?.id ?? null;
            this.tenantCtx.setSelectedCompanyId(sid);
          }
          if (sid != null) {
            this.reloadConnectorContexts();
          }
        },
        error: (err: unknown) => {
          const msg =
            err instanceof HttpErrorResponse && err.status === 422
              ? 'Parámetros no válidos al listar empresas (límite u offset).'
              : 'No se pudieron cargar empresas. Compruebe sesión y API.';
          this.toast.showToast('error', 'Field', msg);
        },
      });
    } else {
      this.reloadConnectorContexts();
    }
  }

  onCompanySelected(id: number | string): void {
    const n = typeof id === 'string' ? Number(id) : id;
    if (!Number.isFinite(n)) {
      return;
    }
    this.tenantCtx.setSelectedCompanyId(n);
    this.reloadConnectorContexts();
  }

  effectiveCompanyId(): number | null {
    if (!this.isSuperAdmin) {
      return this.user.company_id ?? null;
    }
    return this.tenantCtx.selectedCompanyId();
  }

  selectConnector(id: FieldConnectorTabId): void {
    this.activeConnector.set(id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: id === 'dooblo' ? null : id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  connectorBtnClass(id: FieldConnectorTabId): Record<string, boolean> {
    const on = this.activeConnector() === id;
    return {
      'rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/40':
        true,
      'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-50':
        on,
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800':
        !on,
    };
  }

  openDoobloCredentialForm(): void {
    this.doobloCredentialFormOpen.set(true);
  }

  closeDoobloCredentialForm(): void {
    this.doobloCredentialFormOpen.set(false);
    const c = this.doobloCompanyContext();
    if (c) {
      this.doobloFormBaseUrl.set(c.base_url || '');
      this.doobloFormApiUser.set(c.api_user || '');
      this.doobloFormPassword.set('');
    }
  }

  openQualtricsCredentialForm(): void {
    this.qualtricsCredentialFormOpen.set(true);
  }

  closeQualtricsCredentialForm(): void {
    this.qualtricsCredentialFormOpen.set(false);
    const c = this.qualtricsCompanyContext();
    if (c) {
      this.qualtricsFormBaseUrl.set(c.base_url || '');
      this.qualtricsFormApiToken.set('');
    }
  }

  private reloadConnectorContexts(): void {
    this.loadDoobloContext();
    this.loadQualtricsContext();
  }

  private loadDoobloContext(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      this.doobloCompanyContext.set(null);
      return;
    }
    this.doobloCredentialsLoading.set(true);
    this.fieldSvc.getDoobloContext(cid).subscribe({
      next: c => {
        this.doobloCompanyContext.set(c);
        this.doobloFormBaseUrl.set(c.base_url || '');
        this.doobloFormApiUser.set(c.api_user || '');
        this.doobloFormPassword.set('');
        this.doobloCredentialFormOpen.set(!c.configured);
        this.doobloCredentialsLoading.set(false);
      },
      error: () => {
        this.doobloCompanyContext.set(null);
        this.doobloCredentialsLoading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo cargar la configuración Dooblo.');
      },
    });
  }

  saveDoobloCompanyCredentials(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    const base = this.doobloFormBaseUrl().trim();
    const user = this.doobloFormApiUser().trim();
    const pass = this.doobloFormPassword().trim();
    if (!user) {
      this.toast.showToast('warn', 'Field', 'Indique el usuario o REST_KEY de la API Dooblo.');
      return;
    }
    if (!pass && !this.doobloCompanyContext()?.has_password) {
      this.toast.showToast('warn', 'Field', 'Indique la contraseña o clave de la API (primera vez).');
      return;
    }
    this.doobloActionBusy.set(true);
    this.fieldSvc
      .putDoobloCredentials(cid, {
        base_url: base || null,
        api_user: user,
        password: pass || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.showToast('success', 'Field', 'Credenciales SurveyToGo guardadas.');
          this.doobloActionBusy.set(false);
          this.loadDoobloContext();
        },
        error: (err: unknown) => {
          this.doobloActionBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron guardar las credenciales.')
          );
        },
      });
  }

  private loadQualtricsContext(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      this.qualtricsCompanyContext.set(null);
      return;
    }
    this.qualtricsCredentialsLoading.set(true);
    this.fieldSvc.getQualtricsCredentials(cid).subscribe({
      next: c => {
        this.qualtricsCompanyContext.set(c);
        this.qualtricsFormBaseUrl.set(c.base_url || '');
        this.qualtricsFormApiToken.set('');
        this.qualtricsCredentialFormOpen.set(!c.configured);
        this.qualtricsCredentialsLoading.set(false);
      },
      error: () => {
        this.qualtricsCompanyContext.set(null);
        this.qualtricsCredentialsLoading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo cargar la configuración Qualtrics.');
      },
    });
  }

  saveQualtricsCredentials(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    const base = this.qualtricsFormBaseUrl().trim();
    const token = this.qualtricsFormApiToken().trim();
    if (!base && !this.qualtricsCompanyContext()?.base_url) {
      this.toast.showToast('warn', 'Field', 'Indique la URL del datacenter (https://….qualtrics.com).');
      return;
    }
    if (!token && !this.qualtricsCompanyContext()?.has_api_token) {
      this.toast.showToast('warn', 'Field', 'Indique el API token (primera vez).');
      return;
    }
    this.qualtricsActionBusy.set(true);
    this.fieldSvc
      .putQualtricsCredentials(cid, {
        base_url: base || null,
        api_token: token || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.showToast('success', 'Field', 'Credenciales Qualtrics guardadas.');
          this.qualtricsActionBusy.set(false);
          this.loadQualtricsContext();
        },
        error: (err: unknown) => {
          this.qualtricsActionBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron guardar las credenciales Qualtrics.')
          );
        },
      });
  }

  probeQualtrics(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    this.qualtricsProbeBusy.set(true);
    this.fieldSvc.getQualtricsStatus(cid, true).subscribe({
      next: c => {
        this.qualtricsCompanyContext.set(c);
        this.qualtricsProbeBusy.set(false);
        if (c.api_probe_ok === true) {
          this.toast.showToast('success', 'Field', 'Qualtrics respondió correctamente (listado de encuestas).');
        } else if (c.configured) {
          this.toast.showToast(
            'warn',
            'Field',
            c.api_probe_error ?? 'La API no confirmó el token; revise datacenter y permisos.'
          );
        } else {
          this.toast.showToast('warn', 'Field', 'Guarde credenciales antes de validar contra la API.');
        }
      },
      error: () => {
        this.qualtricsProbeBusy.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo ejecutar la validación remota.');
      },
    });
  }

  doobloSourceLabel(): string {
    const c = this.doobloCompanyContext();
    if (!c) {
      return '';
    }
    if (c.source === 'env') {
      return 'Origen: variables de entorno del servidor.';
    }
    if (c.source === 'company') {
      return 'Credenciales guardadas para esta empresa en Siete.';
    }
    return '';
  }

  private httpErrorDetail(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const b = err.error;
      if (b && typeof b === 'object' && 'detail' in b && b['detail'] != null) {
        return String(b['detail']);
      }
    }
    return fallback;
  }
}
