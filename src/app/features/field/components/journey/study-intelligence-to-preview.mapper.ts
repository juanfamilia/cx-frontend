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

/** Severidades motor → tono de tarjeta (sin duplicar reglas del backend). */
function toneFromSignalSeverity(severity: string): JourneyInsightTone {
  const s = (severity || '').toLowerCase();
  if (s === 'error' || s === 'critical' || s === 'stop') {
    return 'caution';
  }
  if (s === 'warn' || s === 'warning' || s === 'fix_now') {
    return 'observe';
  }
  return 'bright';
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

const FATIGUE_RANK = { baja: 1, media: 2, alta: 3 } as const;

function fatigueRank(v: 'baja' | 'media' | 'alta' | null): number {
  if (!v) {
    return 0;
  }
  return FATIGUE_RANK[v];
}

function fatigueFromRank(r: number): 'baja' | 'media' | 'alta' | null {
  if (r >= 3) {
    return 'alta';
  }
  if (r === 2) {
    return 'media';
  }
  if (r === 1) {
    return 'baja';
  }
  return null;
}

export function mapStudyIntelligenceBundleToPreview(
  bundle: StudyIntelligenceBundlePublic,
): ParticipantJourneyPreviewModel {
  const pj = bundle.participant_journey;
  const phasesRaw = pj?.phases?.length ? [...pj.phases].sort((a, b) => a.order_index - b.order_index) : [];

  const seenInsight = new Set<string>();
  const globalInsights: { text: string; tone: JourneyInsightTone }[] = [];

  const pushInsight = (text: string, tone: JourneyInsightTone) => {
    const t = text.trim();
    if (!t || seenInsight.has(t)) {
      return;
    }
    seenInsight.add(t);
    globalInsights.push({ text: t, tone });
  };

  for (const card of bundle.insight_cards) {
    pushInsight([card.headline, card.body].filter(Boolean).join(' — '), toneFromInsightPriority(card.priority));
  }

  for (const r of bundle.operational_risks) {
    pushInsight(r.message_human, 'caution');
  }

  for (const s of bundle.methodological_signals) {
    if (!s.linked_block_id) {
      pushInsight(s.message_human, toneFromSignalSeverity(s.severity));
    }
  }

  for (const f of bundle.fatigue_risks) {
    if (!f.linked_block_id) {
      const conv = fatigueEs(f.level);
      pushInsight(f.message_human, conv === 'alta' ? 'caution' : 'observe');
    }
  }

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

  let unlinkedFatigueBest: 'baja' | 'media' | 'alta' | null = null;
  let unlinkedFatigueRank = 0;
  for (const f of bundle.fatigue_risks) {
    if (f.linked_block_id) {
      continue;
    }
    const conv = fatigueEs(f.level);
    if (!conv) {
      continue;
    }
    const r = FATIGUE_RANK[conv];
    if (r > unlinkedFatigueRank) {
      unlinkedFatigueRank = r;
      unlinkedFatigueBest = conv;
    }
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

    const narrative = [ph.experience_arc_title, (ph.narrative_summary ?? '').trim() || ph.title]
      .filter(Boolean)
      .join(' — ');
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
    let fatigueRankMax = 0;
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
      const r = FATIGUE_RANK[conv];
      if (r > fatigueRankMax) {
        fatigueRankMax = r;
        fatiguePotential = conv;
      }
    }

    let emotionalSensitivity: 'baja' | 'media' | 'alta' | null = null;
    for (const sa of bundle.sensitivity_areas) {
      const ids = sa.linked_block_ids ?? [];
      if (ids.length === 0) {
        continue;
      }
      if (ids.some(id => bidSet.has(id))) {
        emotionalSensitivity = 'media';
        break;
      }
    }
    if (!emotionalSensitivity && bundle.sensitivity_areas.length > 0 && ph.phase_key === 'experience') {
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

  const expIdx = phases.findIndex(p => p.id === 'experience');
  if (expIdx >= 0 && unlinkedFatigueBest != null) {
    const cur = phases[expIdx];
    const mergedR = Math.max(fatigueRank(cur.fatiguePotential), fatigueRank(unlinkedFatigueBest));
    const mergedPot = fatigueFromRank(mergedR);
    phases[expIdx] = { ...cur, fatiguePotential: mergedPot };
  }

  return { phases, globalInsights };
}
