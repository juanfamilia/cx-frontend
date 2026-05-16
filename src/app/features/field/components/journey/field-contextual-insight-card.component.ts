import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

import type { JourneyInsightTone } from './participant-journey.types';

@Component({
  selector: 'field-contextual-insight-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './field-contextual-insight-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldContextualInsightCardComponent {
  readonly message = input.required<string>();
  readonly tone = input<JourneyInsightTone>('observe');

  protected toneClass(t: JourneyInsightTone): Record<string, boolean> {
    return {
      'border-slate-200/90 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-950/40 dark:text-slate-200':
        t === 'observe',
      'border-amber-200/90 bg-amber-50/80 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100':
        t === 'caution',
      'border-emerald-200/90 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/45 dark:bg-emerald-950/30 dark:text-emerald-100':
        t === 'bright',
    };
  }
}
