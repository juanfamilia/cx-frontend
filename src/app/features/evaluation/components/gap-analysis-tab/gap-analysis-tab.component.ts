import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GapAnalysisService, GapAnalysisResult, GapDiscrepancy } from '../../services/gap-analysis.service';

@Component({
  selector: 'app-gap-analysis-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gap-analysis-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GapAnalysisTabComponent implements OnInit {
  private gapService = inject(GapAnalysisService);

  evaluationId = input.required<number>();

  result = signal<GapAnalysisResult | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  criticalCount = computed(() => this.result()?.summary.critical ?? 0);
  highCount = computed(() => this.result()?.summary.high ?? 0);
  reliabilityPct = computed(() => Math.round((this.result()?.reliability_score ?? 0) * 100));

  reliabilityColor = computed(() => {
    const pct = this.reliabilityPct();
    if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  });

  reliabilityBarColor = computed(() => {
    const pct = this.reliabilityPct();
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-yellow-400';
    return 'bg-red-500';
  });

  severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  sortedDiscrepancies = computed(() => {
    const d = this.result()?.discrepancies ?? [];
    return [...d].sort(
      (a, b) => (this.severityOrder[a.severity] ?? 9) - (this.severityOrder[b.severity] ?? 9)
    );
  });

  ngOnInit(): void {
    this.gapService.getForEvaluation(this.evaluationId()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 404
            ? 'No hay análisis de gap disponible para esta evaluación aún.'
            : 'Error al cargar el análisis. Intente de nuevo.'
        );
        this.loading.set(false);
      },
    });
  }

  getSeverityBorderClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'border-l-red-500',
      HIGH: 'border-l-orange-400',
      MEDIUM: 'border-l-yellow-400',
      LOW: 'border-l-blue-400',
    };
    return map[severity] ?? 'border-l-gray-300';
  }

  getSeverityBadgeClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[severity] ?? 'bg-gray-100 text-gray-700';
  }

  getDirectionLabel(d: GapDiscrepancy): string {
    if (d.direction === 'AI_HIGHER') return 'IA más alto';
    if (d.direction === 'AI_LOWER') return 'IA más bajo';
    return 'Discrepancia';
  }

  formatValue(val: number | string | null): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') return val.toFixed(1);
    return String(val);
  }
}
