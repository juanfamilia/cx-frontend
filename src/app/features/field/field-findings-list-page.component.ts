import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Subscription } from 'rxjs';

import { FieldFindingCardComponent } from './components/field-finding-card.component';
import { FieldProjectJourneyContextPanelComponent } from './components/journey/field-project-journey-context-panel.component';
import {
  FieldRiskBadgeComponent,
  FieldRiskUiLevel,
} from './components/field-risk-badge.component';
import { FieldFinding, FieldProjectOverviewRow, FieldService } from './field.service';
import { fieldOverviewAllowsPrefield } from './field-ui.helpers';

@Component({
  selector: 'app-field-findings-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FieldRiskBadgeComponent,
    FieldFindingCardComponent,
    RouterLink,
    FieldProjectJourneyContextPanelComponent,
  ],
  templateUrl: './field-findings-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldFindingsListPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);

  readonly fieldOverviewAllowsPrefield = fieldOverviewAllowsPrefield;

  private readonly routeSub: Subscription;

  readonly overview = signal<FieldProjectOverviewRow | null>(null);
  readonly all = signal<FieldFinding[]>([]);
  readonly loading = signal(true);
  readonly severityFilter = signal<string>('');
  readonly criticalityFilter = signal<string>('');
  readonly interviewerFilter = signal<string>('');
  readonly modalFinding = signal<FieldFinding | null>(null);

  readonly filtered = computed(() => {
    let list = this.all();
    const sev = this.severityFilter().trim().toLowerCase();
    const crit = this.criticalityFilter().trim().toLowerCase();
    const intr = this.interviewerFilter().trim().toLowerCase();
    if (sev) {
      list = list.filter(f => (f.severity || '').toLowerCase().includes(sev));
    }
    if (crit) {
      list = list.filter(f => (f.operational_criticality || '').toLowerCase().includes(crit));
    }
    if (intr) {
      list = list.filter(f => this.interviewerBlob(f).includes(intr));
    }
    return list;
  });

  constructor() {
    this.routeSub = this.route.parent!.paramMap.subscribe(p => {
      const id = Number(p.get('projectId'));
      if (!Number.isFinite(id)) {
        return;
      }
      this.loading.set(true);
      this.overview.set(null);
      this.fieldSvc.getProjectOverview(id, 8).subscribe({
        next: row => this.overview.set(row),
        error: () => this.overview.set(null),
      });
      this.fieldSvc.listDecisionLayerFindings(id, null, 200).subscribe({
        next: rows => {
          this.all.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.all.set([]);
          this.loading.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  rowRisk(severity: string): FieldRiskUiLevel {
    const s = (severity || '').toLowerCase();
    if (s === 'error' || s === 'critical') {
      return 'high';
    }
    if (s === 'warn' || s === 'warning') {
      return 'medium';
    }
    return 'low';
  }

  openDetail(f: FieldFinding): void {
    this.modalFinding.set(f);
  }

  closeDetail(): void {
    this.modalFinding.set(null);
  }

  safeProjectId(): number | null {
    const raw = this.route.parent?.snapshot.paramMap.get('projectId');
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : null;
  }

  findingStatusLabel(f: FieldFinding): string {
    const raw = (f.approval_status || '').trim().toLowerCase();
    if (!raw) {
      return 'Pendiente de revisión';
    }
    if (raw === 'approved') {
      return 'Revisado';
    }
    if (raw === 'rejected') {
      return 'Rechazado';
    }
    if (raw === 'pending') {
      return 'Pendiente de revisión';
    }
    return f.approval_status || 'Pendiente de revisión';
  }

  private interviewerBlob(f: FieldFinding): string {
    const ev = f.evidence;
    let s = '';
    if (ev && typeof ev === 'object') {
      s = JSON.stringify(ev).toLowerCase();
    }
    s += (f.case_id || '').toLowerCase();
    return s;
  }
}
