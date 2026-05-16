import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';

import { FieldRiskBadgeComponent } from './components/field-risk-badge.component';
import { FieldPrimaryNavTabsComponent } from './components/field-primary-nav-tabs.component';
import { companyDisplayLabel } from './field-company.helpers';
import { DoobloCompanyConfig, FieldProjectOverviewRow, FieldService } from './field.service';
import { formatCompletionRatePct, healthToRiskLevel, fieldOverviewAllowsPrefield } from './field-ui.helpers';

@Component({
  selector: 'app-field-project-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FieldRiskBadgeComponent,
    FieldPrimaryNavTabsComponent,
  ],
  templateUrl: './field-project-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldProjectSelectorComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);

  readonly companyDisplayLabel = companyDisplayLabel;
  readonly fieldOverviewAllowsPrefield = fieldOverviewAllowsPrefield;

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
