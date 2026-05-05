import { CommonModule, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';

import { FieldRiskBadgeComponent } from './components/field-risk-badge.component';
import { DoobloCompanyConfig, FieldProjectOverviewRow, FieldService } from './field.service';
import { formatCompletionRatePct, healthToRiskLevel } from './field-ui.helpers';

/** Pestañas de navegación Field (resumen no incluye pestaña propia: esta pantalla es el listado ejecutivo). */
export type FieldPrimaryNavTab = 'inicio' | 'centro' | 'operaciones' | 'neutral';

@Component({
  selector: 'app-field-project-selector',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule, RouterLink, FieldRiskBadgeComponent],
  templateUrl: './field-project-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldProjectSelectorComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);
  private readonly router = inject(Router);

  readonly user = this.auth.getCurrentUser();
  readonly isSuperAdmin = this.user.role === 0;

  readonly companies = signal<Company[]>([]);
  readonly selectedCompanyId = signal<number | null>(null);
  readonly rows = signal<FieldProjectOverviewRow[]>([]);
  readonly loading = signal(false);
  readonly doobloContext = signal<DoobloCompanyConfig | null>(null);

  private static readonly companyListLimit = 100;

  readonly needsDoobloCta = computed(() => {
    const c = this.doobloContext();
    if (!c) {
      return false;
    }
    return !c.configured && (c.source === 'none' || !c.has_password);
  });

  /** Pestaña activa según ruta (en `/field/projects` ninguna de las tres queda resaltada). */
  readonly primaryNavTab = signal<FieldPrimaryNavTab>(this.fieldNavFromUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.primaryNavTab.set(this.fieldNavFromUrl(this.router.url)));
  }

  navTabActive(tab: Exclude<FieldPrimaryNavTab, 'neutral'>): boolean {
    return this.primaryNavTab() === tab;
  }

  navTabClass(tab: Exclude<FieldPrimaryNavTab, 'neutral'>): Record<string, boolean> {
    const on = this.navTabActive(tab);
    return {
      'border-transparent bg-indigo-600 text-white shadow-sm dark:bg-indigo-500': on,
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800':
        !on,
    };
  }

  private fieldNavFromUrl(fullUrl: string): FieldPrimaryNavTab {
    const noHash = fullUrl.split('#')[0] ?? '';
    const qIdx = noHash.indexOf('?');
    const path = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
    const query = qIdx >= 0 ? noHash.slice(qIdx + 1) : '';
    const params = new URLSearchParams(query);

    if (path === '/field') {
      return 'inicio';
    }
    if (path === '/field/projects') {
      return 'neutral';
    }
    if (path === '/field/trabajo') {
      return params.get('focus') === 'overview' ? 'centro' : 'operaciones';
    }
    return 'neutral';
  }

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, FieldProjectSelectorComponent.companyListLimit).subscribe({
        next: res => {
          this.companies.set(res.data);
          const first = res.data[0]?.id ?? null;
          this.selectedCompanyId.set(first);
          if (first != null) {
            this.refreshCompanyContext();
          }
        },
        error: (err: unknown) => {
          const msg =
            err instanceof HttpErrorResponse && err.status === 422
              ? 'Parámetros no válidos al listar empresas.'
              : 'No se pudieron cargar empresas.';
          this.toast.showToast('error', 'Field', msg);
        },
      });
    } else {
      this.selectedCompanyId.set(this.user.company_id ?? null);
      this.refreshCompanyContext();
    }
  }

  effectiveCompanyId(): number | null {
    return this.selectedCompanyId();
  }

  onCompanySelected(id: number | string): void {
    const n = typeof id === 'string' ? Number(id) : id;
    if (!Number.isFinite(n)) {
      return;
    }
    this.selectedCompanyId.set(n);
    this.refreshCompanyContext();
  }

  riskLevel(row: FieldProjectOverviewRow) {
    return healthToRiskLevel(row.health);
  }

  progressLabel(row: FieldProjectOverviewRow): string {
    return formatCompletionRatePct(row);
  }

  criticalOpen(row: FieldProjectOverviewRow): number {
    return row.findings_open_by_severity?.['error'] ?? 0;
  }

  private refreshCompanyContext(): void {
    const cid = this.effectiveCompanyId();
    this.rows.set([]);
    if (cid == null) {
      this.doobloContext.set(null);
      return;
    }
    this.fieldSvc.getDoobloContext(cid).subscribe({
      next: c => this.doobloContext.set(c),
      error: () => this.doobloContext.set(null),
    });
    this.reloadOverview();
  }

  reloadOverview(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    this.loading.set(true);
    this.fieldSvc.listProjectsOverview(cid, null).subscribe({
      next: data => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo cargar el listado de proyectos.');
      },
    });
  }
}
