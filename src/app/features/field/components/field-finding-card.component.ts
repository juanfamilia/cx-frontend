import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FieldFinding } from '../field.service';

import { FieldRiskBadgeComponent, FieldRiskUiLevel } from './field-risk-badge.component';

@Component({
  selector: 'app-field-finding-card',
  standalone: true,
  imports: [FieldRiskBadgeComponent],
  template: `
    <div
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {{ finding.code }}
          </p>
          <p class="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{{ finding.message }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {{ finding.severity }}
          </span>
          @if (criticalityLabel()) {
            <span
              class="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
              {{ criticalityLabel() }}
            </span>
          }
          <app-field-risk-badge [level]="severityRiskLevel()" />
        </div>
      </div>
      @if (finding.explanation) {
        <p class="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <span class="font-semibold text-slate-900 dark:text-slate-100">Qué pasó: </span>{{ finding.explanation }}
        </p>
      }
      @if (finding.recommendation) {
        <p class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <span class="font-semibold text-slate-900 dark:text-slate-100">Qué hacer: </span
          >{{ finding.recommendation }}
        </p>
      }
      @if (finding.case_id) {
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Caso: {{ finding.case_id }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldFindingCardComponent {
  @Input({ required: true }) finding!: FieldFinding;

  criticalityLabel(): string | null {
    const c = this.finding.operational_criticality?.trim();
    if (!c) {
      return null;
    }
    if (c === 'STOP') {
      return 'STOP';
    }
    if (c === 'FIX_NOW') {
      return 'FIX NOW';
    }
    if (c === 'MONITOR') {
      return 'MONITOR';
    }
    return c;
  }

  severityRiskLevel(): FieldRiskUiLevel {
    const s = (this.finding.severity || '').toLowerCase();
    if (s === 'error' || s === 'critical') {
      return 'high';
    }
    if (s === 'warn' || s === 'warning') {
      return 'medium';
    }
    return 'low';
  }
}
