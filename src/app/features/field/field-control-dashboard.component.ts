import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ShareToasterService } from '@core/services/toast.service';

import { FieldFindingCardComponent } from './components/field-finding-card.component';
import { FieldKpiCardComponent } from './components/field-kpi-card.component';
import { FieldRiskBadgeComponent } from './components/field-risk-badge.component';
import {
  FieldFinding,
  FieldProjectOverviewRow,
  FieldService,
} from './field.service';
import {
  formatCompletionRatePct,
  executiveHealthReason,
  fieldOverviewAllowsPrefield,
  healthExecutiveLabel,
  healthToRiskLevel,
  openSeverityCount,
  operationalNextStepHint,
} from './field-ui.helpers';
import { FieldRiskUiLevel } from './components/field-risk-badge.component';

@Component({
  selector: 'app-field-control-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    RouterLink,
    FieldKpiCardComponent,
    FieldRiskBadgeComponent,
    FieldFindingCardComponent,
  ],
  templateUrl: './field-control-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldControlDashboardComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);

  readonly overview = signal<FieldProjectOverviewRow | null>(null);
  readonly findings = signal<FieldFinding[]>([]);
  readonly loading = signal(true);
  readonly selectedFinding = signal<FieldFinding | null>(null);
  readonly approvalBusy = signal(false);

  readonly executiveHealthReason = executiveHealthReason;
  readonly fieldOverviewAllowsPrefield = fieldOverviewAllowsPrefield;

  private sub?: Subscription;

  constructor() {
    this.sub = this.route.parent!.paramMap.subscribe(p => {
      const id = Number(p.get('projectId'));
      if (!Number.isFinite(id)) {
        return;
      }
      this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private load(projectId: number): void {
    this.loading.set(true);
    this.selectedFinding.set(null);
    this.fieldSvc.getProjectOverview(projectId, 12).subscribe({
      next: ov => {
        this.overview.set(ov);
        this.fieldSvc.listDecisionLayerFindings(projectId, null, 80).subscribe({
          next: list => {
            this.findings.set(list);
            this.loading.set(false);
          },
          error: () => {
            this.findings.set([]);
            this.loading.set(false);
            this.toast.showToast('warn', 'Field', 'No se pudieron cargar los hallazgos del proyecto.');
          },
        });
      },
      error: () => {
        this.overview.set(null);
        this.findings.set([]);
        this.loading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo cargar el resumen del proyecto.');
      },
    });
  }

  dashboardHealthReasons(): string[] {
    return this.overview()?.health_reasons ?? [];
  }

  projectId(): number {
    const raw = this.route.parent!.snapshot.paramMap.get('projectId');
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : NaN;
  }

  safeDashboardProjectId(): number | null {
    const id = this.projectId();
    return Number.isFinite(id) ? id : null;
  }

  globalRiskLevel() {
    const ov = this.overview();
    if (!ov) {
      return healthToRiskLevel('green');
    }
    return healthToRiskLevel(ov.health);
  }

  /** Etiqueta legible para el semáforo de salud (sin exponer códigos crudos en UI). */
  healthSummaryLabel(): string {
    return healthExecutiveLabel(this.overview()?.health);
  }

  nextStepHint(): string {
    return operationalNextStepHint(this.overview());
  }

  kpiWarn(): string {
    return String(openSeverityCount(this.overview(), 'warn'));
  }

  kpiPendingReview(): string {
    const n = this.overview()?.findings_pending_review;
    return n != null ? String(n) : '—';
  }

  kpiProgress(): string {
    const ov = this.overview();
    return ov ? formatCompletionRatePct(ov) : '—';
  }

  kpiInterviews(): string {
    const ov = this.overview();
    const n = ov?.tabular_row_count;
    return n != null ? String(n) : '—';
  }

  kpiCritical(): string {
    const ov = this.overview();
    const n = ov?.findings_open_by_severity?.['error'] ?? 0;
    return String(n);
  }

  rowRiskFromSeverity(severity: string): FieldRiskUiLevel {
    const s = (severity || '').toLowerCase();
    if (s === 'error' || s === 'critical') {
      return 'high';
    }
    if (s === 'warn' || s === 'warning') {
      return 'medium';
    }
    return 'low';
  }

  interviewerLabel(f: FieldFinding): string {
    const ev = f.evidence;
    if (ev && typeof ev === 'object') {
      const o = ev as Record<string, unknown>;
      const name = o['interviewer_name'] ?? o['InterviewerName'];
      const id = o['interviewer_id'] ?? o['InterviewerId'];
      if (typeof name === 'string' && name.trim()) {
        return name.trim();
      }
      if (id != null && String(id).trim()) {
        return `ID ${String(id)}`;
      }
    }
    return '—';
  }

  selectFinding(f: FieldFinding): void {
    this.selectedFinding.set(f);
  }

  rowSelected(f: FieldFinding): boolean {
    return this.selectedFinding()?.id === f.id;
  }

  markReviewed(): void {
    const pid = this.projectId();
    const f = this.selectedFinding();
    if (!Number.isFinite(pid) || !f) {
      return;
    }
    this.approvalBusy.set(true);
    this.fieldSvc.patchFindingApproval(pid, f.id, { status: 'approved' }).subscribe({
      next: () => {
        this.approvalBusy.set(false);
        this.toast.showToast('success', 'Field', 'Estado actualizado: hallazgo marcado como revisado.');
        this.load(pid);
      },
      error: () => {
        this.approvalBusy.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo actualizar el estado del hallazgo.');
      },
    });
  }
}
