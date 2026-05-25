import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FieldParticipantPhaseCardComponent } from './field-participant-phase-card.component';
import { FieldContextualInsightCardComponent } from './field-contextual-insight-card.component';
import { FieldParticipantJourneyFlowComponent } from './field-participant-journey-flow.component';
import type { JourneyInsightTone, ParticipantJourneyPreviewModel } from './participant-journey.types';

@Component({
  selector: 'field-participant-journey-preview',
  standalone: true,
  imports: [
    NgClass,
    FieldParticipantPhaseCardComponent,
    FieldContextualInsightCardComponent,
    FieldParticipantJourneyFlowComponent,
  ],
  templateUrl: './field-participant-journey-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldParticipantJourneyPreviewComponent {
  readonly model = input<ParticipantJourneyPreviewModel | null>(null);
  readonly studyFocusLine = input<string>('');
  readonly loading = input(false);
  readonly hasRevision = input(false);
  /** Motor API vivo vs fallback neutro (no mezclar con Readiness oficial). */
  readonly intelligenceSource = input<'live' | 'fallback' | null>(null);

  protected metricChipClass(tone: JourneyInsightTone): Record<string, boolean> {
    return {
      'border-slate-200/90 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-950/40 dark:text-slate-200':
        tone === 'observe',
      'border-amber-200/90 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100':
        tone === 'caution',
      'border-emerald-200/90 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/45 dark:bg-emerald-950/30 dark:text-emerald-100':
        tone === 'bright',
    };
  }
}
