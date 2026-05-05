import { FieldRiskUiLevel } from './components/field-risk-badge.component';
import { FieldMetric, FieldProjectOverviewRow } from './field.service';

export function healthToRiskLevel(health: FieldProjectOverviewRow['health']): FieldRiskUiLevel {
  if (health === 'red') {
    return 'high';
  }
  if (health === 'amber') {
    return 'medium';
  }
  return 'low';
}

/** completion_rate del overview viene como fracción 0–1 en MVP backend. */
export function formatCompletionRatePct(row: FieldProjectOverviewRow): string {
  const m = row.kpis_latest?.find(k => k.metric_code === 'completion_rate');
  if (!m) {
    return '—';
  }
  const v = m.value;
  const pct = v <= 1 ? Math.round(v * 100) : Math.round(v);
  return `${pct}%`;
}

export function getLatestMetricValue(metrics: FieldMetric[] | undefined, code: string): number | null {
  const m = metrics?.find(k => k.metric_code === code);
  return m != null ? m.value : null;
}
