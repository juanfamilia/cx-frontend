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
import { RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';

import {
  DoobloFailedCustomer,
  DoobloCompanyConfig,
  FieldService,
  OrganizationStudioProjectsCatalogPage,
  RemoteFieldCatalogItem,
} from './field.service';
import { FieldPrimaryNavTabsComponent } from './components/field-primary-nav-tabs.component';
import { companyDisplayLabel } from './field-company.helpers';

@Component({
  selector: 'app-field-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FieldPrimaryNavTabsComponent],
  templateUrl: './field-landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldLandingComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);

  readonly companyDisplayLabel = companyDisplayLabel;

  readonly user = this.auth.getCurrentUser();
  readonly isSuperAdmin = this.user.role === 0;

  readonly companies = signal<Company[]>([]);
  readonly selectedCompanyId = signal<number | null>(null);

  readonly doobloCompanyContext = signal<DoobloCompanyConfig | null>(null);
  readonly doobloCredentialsLoading = signal(false);
  readonly doobloFormBaseUrl = signal('');
  readonly doobloFormApiUser = signal('');
  readonly doobloFormPassword = signal('');
  readonly doobloActionBusy = signal(false);

  readonly orgCatalog = signal<OrganizationStudioProjectsCatalogPage | null>(null);
  readonly orgCatalogBusy = signal(false);

  private static readonly companyListLimit = 100;

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, FieldLandingComponent.companyListLimit).subscribe({
        next: res => {
          this.companies.set(res.data);
          const first = res.data[0]?.id ?? null;
          this.selectedCompanyId.set(first);
          if (first != null) {
            this.loadFieldDoobloCompanyContext();
          }
        },
        error: (err: unknown) => {
          const msg =
            err instanceof HttpErrorResponse && err.status === 422
              ? 'Parámetros no válidos al listar empresas (límite o offset).'
              : 'No se pudieron cargar empresas. Compruebe sesión y API.';
          this.toast.showToast('error', 'Field', msg);
        },
      });
    } else {
      this.selectedCompanyId.set(this.user.company_id ?? null);
      this.loadFieldDoobloCompanyContext();
    }
  }

  onCompanySelected(id: number | string): void {
    const n = typeof id === 'string' ? Number(id) : id;
    if (!Number.isFinite(n)) {
      return;
    }
    this.selectedCompanyId.set(n);
    this.orgCatalog.set(null);
    this.loadFieldDoobloCompanyContext();
  }

  effectiveCompanyId(): number | null {
    return this.selectedCompanyId();
  }

  private loadFieldDoobloCompanyContext(): void {
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
        this.doobloCredentialsLoading.set(false);
        if (c.configured) {
          this.refreshOrgPulse({ announceFailures: false });
        } else {
          this.orgCatalog.set(null);
        }
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
          this.toast.showToast('success', 'Field', 'Credenciales guardadas. Actualizando proyectos…');
          this.doobloActionBusy.set(false);
          this.loadFieldDoobloCompanyContext();
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

  /**
   * Listado org-wide de proyectos Studio en SurveyToGo para la cuenta API actual.
   * Es la base del “pulso ejecutivo” en una sola pantalla.
   */
  refreshOrgPulse(opts?: { announceFailures?: boolean }): void {
    const cid = this.effectiveCompanyId();
    const announce = opts?.announceFailures ?? false;
    if (cid == null || !this.doobloCompanyContext()?.configured) {
      return;
    }
    this.orgCatalogBusy.set(true);
    this.fieldSvc
      .listDoobloOrganizationStudioProjectsCatalog(cid, {
        page: 1,
        page_size: 50,
        max_customers: 25,
      })
      .subscribe({
        next: data => {
          this.orgCatalog.set(data);
          this.orgCatalogBusy.set(false);
          const failed = data.failed_customers ?? [];
          if (announce && failed.length > 0) {
            const preview = failed
              .slice(0, 3)
              .map(
                f =>
                  `${f.customer_id}: ${f.reason.slice(0, 60)}${f.reason.length > 60 ? '…' : ''}`
              )
              .join(' · ');
            this.toast.showToast(
              'warn',
              'Field',
              `${failed.length} cliente(s) con incidencia al leer proyectos. ${preview}`
            );
          }
        },
        error: (err: unknown) => {
          this.orgCatalogBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron listar los proyectos activos en SurveyToGo.')
          );
        },
      });
  }

  previewProjects(): RemoteFieldCatalogItem[] {
    return this.orgCatalog()?.items?.slice(0, 12) ?? [];
  }

  studioProjectsTotal(): number {
    return this.orgCatalog()?.total ?? this.orgCatalog()?.items?.length ?? 0;
  }

  /** Distintos clientes SurveyToGo cuando el catálogo trae `studio_customer_id`. */
  distinctStudioCustomers(): number | null {
    const items = this.orgCatalog()?.items ?? [];
    const ids = items.map(i => i.studio_customer_id?.trim()).filter((x): x is string => !!x);
    if (ids.length === 0) {
      return items.length ? null : 0;
    }
    return new Set(ids).size;
  }

  failedCustomersCount(): number {
    return this.orgCatalog()?.failed_customers?.length ?? 0;
  }

  failurePreview(max = 8): DoobloFailedCustomer[] {
    return (this.orgCatalog()?.failed_customers ?? []).slice(0, max);
  }

  trackByExternalId(_i: number, row: RemoteFieldCatalogItem): string {
    return row.external_id;
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
      return 'Credenciales guardadas para esta empresa en esta consola.';
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
