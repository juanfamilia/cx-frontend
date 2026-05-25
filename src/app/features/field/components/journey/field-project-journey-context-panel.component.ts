import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { StudyIntelligenceBundlePublic } from '../../field.service';
import { FieldContextualInsightCardComponent } from './field-contextual-insight-card.component';
import { FieldParticipantJourneyFlowComponent } from './field-participant-journey-flow.component';
import type { JourneyInsightTone } from './participant-journey.types';
import { mapStudyIntelligenceBundleToPreview } from './study-intelligence-to-preview.mapper';

@Component({
  selector: 'field-project-journey-context-panel',
  standalone: true,
  imports: [NgClass, RouterLink, FieldContextualInsightCardComponent, FieldParticipantJourneyFlowComponent],
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
      (b.sensitivity_areas?.length ?? 0) > 0 ||
      Object.keys(b.contextual_scores ?? {}).length > 0
    );
  });

  headline = computed(() => {
    const b = this.bundle();
    const c = b?.insight_cards?.[0];
    const h = c?.headline?.trim();
    return h || null;
  });

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
