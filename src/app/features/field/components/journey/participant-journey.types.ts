/** Fase 1 — Journey Intelligence (PRE-FIELD). Modelo de vista; sin datos inventados. */

export type JourneyInsightTone = 'observe' | 'caution' | 'bright';

export type JourneyPhaseUiState = 'rich' | 'light' | 'waiting';

export interface JourneyPhasePreview {
  readonly id: string;
  readonly title: string;
  readonly narrative: string;
  readonly blockObjective: string;
  readonly expectedRisk: string | null;
  readonly fatiguePotential: 'baja' | 'media' | 'alta' | null;
  readonly emotionalSensitivity: 'baja' | 'media' | 'alta' | null;
  readonly automaticSignals: readonly string[];
  readonly contextualInsights: readonly { readonly text: string; readonly tone: JourneyInsightTone }[];
  readonly uiState: JourneyPhaseUiState;
}

export interface ParticipantJourneyInput {
  readonly briefPayload: Record<string, unknown> | null;
  readonly guidedObjective: string;
  readonly guidedBusinessQuestion: string;
  readonly guidedAudience: string;
  readonly guidedMarket: string;
  readonly guidedExpectedOutcome: string;
  readonly blockTitles: readonly string[];
  readonly qaLastOk: boolean | null;
  readonly qaIssueCount: number | null;
  readonly readinessBlockingFirstCode: string | null;
}

/** Vista preview — lo construye el mapper desde `StudyIntelligenceBundlePublic` o fallback mínimo. */
export interface ParticipantJourneyPreviewModel {
  readonly phases: readonly JourneyPhasePreview[];
  readonly globalInsights: readonly { readonly text: string; readonly tone: JourneyInsightTone }[];
}
