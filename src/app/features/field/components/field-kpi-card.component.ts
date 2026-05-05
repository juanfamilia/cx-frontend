import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-field-kpi-card',
  standalone: true,
  template: `
    <div
      class="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {{ title }}
      </p>
      <p class="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {{ value }}
      </p>
      @if (trend) {
        <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ trend }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldKpiCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input() trend?: string | null;
}
