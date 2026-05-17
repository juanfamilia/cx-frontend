import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { StudyIntelligenceBundlePublic } from '../../field.service';
import { FieldContextualInsightCardComponent } from './field-contextual-insight-card.component';
import { mapStudyIntelligenceBundleToPreview } from './study-intelligence-to-preview.mapper';

@Component({
  selector: 'field-project-journey-context-panel',
  standalone: true,
  imports: [RouterLink, FieldContextualInsightCardComponent],
  templateUrl: './field-project-journey-context-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldProjectJourneyContextPanelComponent {
  /** Bundle persistido en overview (`GET …/projects/{id}/overview`). */
  bundle = input<StudyIntelligenceBundlePublic | null | undefined>(null);
  projectId = input.required<number>();
  allowPrefieldLink = input(false);

  preview = computed(() => {
    const b = this.bundle();
    if (!b) {
      return null;
    }
    return mapStudyIntelligenceBundleToPreview(b);
  });

  hasAny = computed(() => {
    const b = this.bundle();
    if (!b) {
      return false;
    }
    return (
      (b.insight_cards?.length ?? 0) > 0 ||
      (b.participant_journey?.phases?.length ?? 0) > 0 ||
      (b.operational_risks?.length ?? 0) > 0 ||
      (b.fatigue_risks?.length ?? 0) > 0 ||
      (b.methodological_signals?.length ?? 0) > 0 ||
      (b.expected_dropout_zones?.length ?? 0) > 0 ||
      (b.sensitivity_areas?.length ?? 0) > 0
    );
  });

  headline = computed(() => {
    const b = this.bundle();
    const c = b?.insight_cards?.[0];
    const h = c?.headline?.trim();
    return h || null;
  });
}
