import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FieldParticipantPhaseCardComponent } from './field-participant-phase-card.component';
import { FieldContextualInsightCardComponent } from './field-contextual-insight-card.component';
import type { ParticipantJourneyPreviewModel } from './participant-journey-preview.helper';

@Component({
  selector: 'field-participant-journey-preview',
  standalone: true,
  imports: [FieldParticipantPhaseCardComponent, FieldContextualInsightCardComponent],
  templateUrl: './field-participant-journey-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldParticipantJourneyPreviewComponent {
  readonly model = input<ParticipantJourneyPreviewModel | null>(null);
  readonly studyFocusLine = input<string>('');
  readonly loading = input(false);
  readonly hasRevision = input(false);
}
