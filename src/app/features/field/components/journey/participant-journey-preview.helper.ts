/**
 * Utilidades ligeras PRE-FIELD journey — sin motor metodológico.
 * El análisis vive en backend: `GET .../study-intelligence`.
 */

import type {
  JourneyPhasePreview,
  ParticipantJourneyInput,
  ParticipantJourneyPreviewModel,
} from './participant-journey.types';

function trimJoinBrief(input: ParticipantJourneyInput): string {
  const chunks = [
    input.guidedObjective,
    input.guidedBusinessQuestion,
    input.guidedAudience,
    input.guidedMarket,
    input.guidedExpectedOutcome,
  ]
    .map(s => s.trim())
    .filter(Boolean);
  const payload = input.briefPayload;
  if (payload && typeof payload === 'object') {
    const keys = ['methodology', 'study_type', 'hypothesis', 'constraints', 'notes'];
    for (const k of keys) {
      const v = payload[k];
      if (typeof v === 'string' && v.trim()) {
        chunks.push(v.trim());
      }
    }
  }
  return chunks.join(' ').toLowerCase();
}

/** Línea corta de foco del estudio (solo texto ya cargado en cliente — brief guiado). */
export function journeyStudyFocusLine(input: ParticipantJourneyInput): string {
  const q = input.guidedBusinessQuestion.trim();
  if (q.length >= 12) {
    return q.length > 160 ? `${q.slice(0, 157)}…` : q;
  }
  const o = input.guidedObjective.trim();
  if (o.length >= 12) {
    return o.length > 160 ? `${o.slice(0, 157)}…` : o;
  }
  const blob = trimJoinBrief(input);
  if (blob.length >= 12) {
    return 'Complete el brief con la pregunta de negocio y el objetivo para personalizar este recorrido.';
  }
  return 'Cuando el brief y el cuestionario tengan más detalle, el relato se alinea desde el servidor.';
}

function neutralPhase(p: Omit<JourneyPhasePreview, 'automaticSignals' | 'contextualInsights'>): JourneyPhasePreview {
  return { ...p, automaticSignals: [], contextualInsights: [] };
}

function narrativeSpineFromPhaseTitles(phases: readonly { title: string }[]): string | null {
  const titles = phases.map(p => p.title.trim()).filter(Boolean);
  if (titles.length < 2) {
    return null;
  }
  if (titles.length <= 5) {
    return titles.join(' → ');
  }
  return `${titles[0]} → … → ${titles[titles.length - 1]} · ${titles.length} etapas`;
}

/**
 * Fallback mínimo si falla `study-intelligence` (red/offline).
 * No replica reglas del servidor — solo estructura neutra.
 */
export function minimalNeutralJourneyFallback(): ParticipantJourneyPreviewModel {
  const phases: JourneyPhasePreview[] = [
    neutralPhase({
      id: 'intro',
      title: 'Introducción',
      narrative: 'Por qué participa y qué puede esperar.',
      blockObjective: 'Generar contexto antes de preguntas sustantivas.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
    neutralPhase({
      id: 'screening',
      title: 'Selección',
      narrative: 'Confirmar que encaja con el público objetivo.',
      blockObjective: 'Filtrar sin alargarse innecesariamente.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
    neutralPhase({
      id: 'experience',
      title: 'Experiencia central',
      narrative: 'El momento principal del estudio.',
      blockObjective: 'Capturar lo relevante para la decisión.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
    neutralPhase({
      id: 'satisfaction',
      title: 'Valoración',
      narrative: 'Impresión general con la experiencia reciente.',
      blockObjective: 'Sintetizar actitud o satisfacción.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
    neutralPhase({
      id: 'demographics',
      title: 'Perfil',
      narrative: 'Datos de perfil cuando aplique.',
      blockObjective: 'Segmentación sin cansar antes de tiempo.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
    neutralPhase({
      id: 'close',
      title: 'Cierre',
      narrative: 'Agradecimiento y salida clara.',
      blockObjective: 'Cerrar con tono profesional.',
      expectedRisk: null,
      fatiguePotential: null,
      emotionalSensitivity: null,
      uiState: 'light',
    }),
  ];

  const narrativeSpine = narrativeSpineFromPhaseTitles(phases);

  return {
    phases,
    globalInsights: [
      {
        tone: 'observe',
        text:
          'No pudimos cargar el análisis del servidor. Cuando haya conexión, el recorrido reflejará su borrador y brief sin duplicar lógica aquí.',
      },
    ],
    journeyMetrics: [],
    narrativeSpine,
    glanceHighlights: [],
  };
}
