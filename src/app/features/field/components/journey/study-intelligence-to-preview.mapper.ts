/**
 * Mapea la respuesta del motor backend a la vista del preview.
 * No contiene heurísticas metodológicas — solo traducción visual.
 */

import type { StudyIntelligenceBundlePublic } from '../../field.service';
import type {
  JourneyInsightTone,
  JourneyPhasePreview,
  ParticipantJourneyPreviewModel,
} from './participant-journey.types';

function toneFromInsightPriority(priority: string): JourneyInsightTone {
  switch (priority) {
    case 'must_act':
    case 'high':
      return 'caution';
    case 'medium':
      return 'observe';
    case 'low':
    case 'fyi':
      return 'bright';
    default:
      return 'observe';
  }
}

function fatigueEs(level: string): 'baja' | 'media' | 'alta' | null {
  switch (level.toLowerCase()) {
    case 'low':
      return 'baja';
    case 'medium':
      return 'media';
    case 'high':
      return 'alta';
    default:
      return null;
  }
}

export function mapStudyIntelligenceBundleToPreview(
  bundle: StudyIntelligenceBundlePublic
): ParticipantJourneyPreviewModel {
  const pj = bundle.participant_journey;
  const phasesRaw = pj?.phases?.length ? [...pj.phases].sort((a, b) => a.order_index - b.order_index) : [];

  const globalInsights = bundle.insight_cards.map(card => ({
    text: [card.headline, card.body].filter(Boolean).join(' — '),
    tone: toneFromInsightPriority(card.priority),
  }));

  const methodologicalByBlock = new Map<string, string[]>();
  for (const s of bundle.methodological_signals) {
    const bid = s.linked_block_id;
    if (!bid) {
      continue;
    }
    const arr = methodologicalByBlock.get(bid) ?? [];
    arr.push(s.message_human);
    methodologicalByBlock.set(bid, arr);
  }

  const phases: JourneyPhasePreview[] = phasesRaw.map(ph => {
    const bids = ph.block_ids ?? [];
    const bidSet = new Set(bids);
    const signals: string[] = [];
    for (const bid of bids) {
      const msgs = methodologicalByBlock.get(bid);
      if (msgs?.length) {
        signals.push(...msgs);
      }
    }

    const narrative = (ph.narrative_summary ?? '').trim() || ph.title;
    const blockObjective =
      bids.length > 0
        ? `Etapa con ${bids.length} bloque(s) enlazado(s) del borrador actual.`
        : 'Etapa sin bloques reconocidos todavía en este borrador.';

    let expectedRisk: string | null = null;
    for (const z of bundle.expected_dropout_zones) {
      if (z.phase_key === ph.phase_key || (z.linked_block_id && bidSet.has(z.linked_block_id))) {
        expectedRisk = z.message_human;
        break;
      }
    }

    let fatiguePotential: 'baja' | 'media' | 'alta' | null = null;
    const rank = { baja: 1, media: 2, alta: 3 } as const;
    let fatigueRank = 0;
    for (const f of bundle.fatigue_risks) {
      if (f.linked_block_id && !bidSet.has(f.linked_block_id)) {
        continue;
      }
      if (!f.linked_block_id) {
        continue;
      }
      const conv = fatigueEs(f.level);
      if (!conv) {
        continue;
      }
      const r = rank[conv];
      if (r > fatigueRank) {
        fatigueRank = r;
        fatiguePotential = conv;
      }
    }

    let emotionalSensitivity: 'baja' | 'media' | 'alta' | null = null;
    if (bundle.sensitivity_areas.length > 0 && ph.phase_key === 'experience') {
      emotionalSensitivity = 'media';
    }

    const contextualInsights: { text: string; tone: JourneyInsightTone }[] = [];
    if (expectedRisk) {
      contextualInsights.push({ text: expectedRisk, tone: 'observe' });
    }

    const uiState = bids.length > 0 ? 'rich' : 'light';

    return {
      id: ph.phase_key,
      title: ph.title,
      narrative,
      blockObjective,
      expectedRisk,
      fatiguePotential,
      emotionalSensitivity,
      automaticSignals: signals,
      contextualInsights,
      uiState,
    };
  });

  return { phases, globalInsights };
}
