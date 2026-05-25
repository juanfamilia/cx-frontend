import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { JourneyPhasePreview } from './participant-journey.types';

@Component({
  selector: 'field-participant-journey-flow',
  standalone: true,
  imports: [NgClass],
  templateUrl: './field-participant-journey-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldParticipantJourneyFlowComponent {
  readonly phases = input.required<readonly JourneyPhasePreview[]>();
  /** `full` — PRE-FIELD; `compact` — FIELD / tablero. */
  readonly variant = input<'full' | 'compact'>('full');

  protected dotClass(ph: JourneyPhasePreview): Record<string, boolean> {
    const caution = !!(ph.expectedRisk || ph.fatiguePotential === 'alta' || ph.emotionalSensitivity);
    return {
      'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-500':
        ph.uiState === 'rich',
      'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100':
        ph.uiState !== 'rich' && !caution,
      'border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-50':
        ph.uiState !== 'rich' && caution,
    };
  }
}
