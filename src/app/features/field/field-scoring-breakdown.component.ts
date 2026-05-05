import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { FieldMetric, FieldProjectOverviewRow, FieldService } from './field.service';

@Component({
  selector: 'app-field-scoring-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-scoring-breakdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldScoringBreakdownComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);

  private readonly routeSub: Subscription;

  readonly overview = signal<FieldProjectOverviewRow | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.routeSub = this.route.parent!.paramMap.subscribe(p => {
      const id = Number(p.get('projectId'));
      if (!Number.isFinite(id)) {
        return;
      }
      this.loading.set(true);
      this.fieldSvc.getProjectOverview(id, 4).subscribe({
        next: row => {
          this.overview.set(row);
          this.loading.set(false);
        },
        error: () => {
          this.overview.set(null);
          this.loading.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  sortedMetrics(): FieldMetric[] {
    const kpis = this.overview()?.kpis_latest ?? [];
    return [...kpis].sort((a, b) => a.metric_code.localeCompare(b.metric_code));
  }

  dimensionNote(m: FieldMetric): string {
    const d = m.dimensions;
    if (d && typeof d === 'object' && 'note' in d && typeof (d as { note?: unknown }).note === 'string') {
      return (d as { note: string }).note;
    }
    return '';
  }
}
