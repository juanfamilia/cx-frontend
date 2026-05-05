import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Nivel de riesgo para UI (product spec). */
export type FieldRiskUiLevel = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-field-risk-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      [ngClass]="badgeClass()">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldRiskBadgeComponent {
  @Input({ required: true }) set level(v: FieldRiskUiLevel) {
    this._level = v;
  }
  get level(): FieldRiskUiLevel {
    return this._level;
  }
  private _level: FieldRiskUiLevel = 'low';

  badgeClass(): Record<string, boolean> {
    switch (this._level) {
      case 'high':
        return {
          'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200': true,
        };
      case 'medium':
        return {
          'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100': true,
        };
      default:
        return {
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200': true,
        };
    }
  }

  label(): string {
    switch (this._level) {
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      default:
        return 'Bajo';
    }
  }
}
