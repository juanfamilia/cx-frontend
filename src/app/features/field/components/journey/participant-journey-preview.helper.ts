/**
 * Utilidades ligeras PRE-FIELD journey — sin motor metodológico.
 * El análisis vive en backend: `GET .../study-intelligence`.
 */

import type {
  JourneyPhasePreview,
  ParticipantJourneyInput,
  ParticipantJourneyPreviewModel,
} from './participant-journey.types';

/** Índice de fase 0..5 según título de bloque (solo lectura técnica / UX puntual). */
export function phaseIndexForBlockTitle(title: string): number {
  const t = title.toLowerCase();
  const tests: { i: number; keys: string[] }[] = [
    { i: 0, keys: ['intro', 'bienven', 'contexto', 'propósito', 'proposito', 'calibr'] },
    { i: 1, keys: ['screen', 'filt', 'elegib', 'cuota', 'recruit', 'target'] },
    { i: 2, keys: ['experien', 'jornada', 'uso', 'touch', 'compra', 'visita', 'interacc', 'onboarding'] },
    { i: 3, keys: ['satisf', 'nps', 'csat', 'recomen', 'valoración', 'valoracion'] },
    { i: 4, keys: ['demográf', 'demograf', 'socio', 'edad', 'género', 'genero', 'ingreso', 'perfil'] },
    { i: 5, keys: ['cierre', 'desped', 'thank', 'gracia', 'final'] },
  ];
  for (const { i, keys } of tests) {
    if (keys.some(k => t.includes(k))) {
      return i;
    }
  }
  return -1;
}

/** Títulos de bloques desde `instrument_spec` (solo datos existentes). */
export function extractBlockTitlesFromSpec(spec: Record<string, unknown> | null | undefined): string[] {
  if (!spec || typeof spec !== 'object') {
    return [];
  }
  let arr: unknown[] | null = null;
  for (const k of ['blocks', 'sections', 'pages', 'items']) {
    const v = spec[k];
    if (Array.isArray(v) && v.length > 0) {
      arr = v;
      break;
    }
  }
  if (!arr) {
    return [];
  }
  return arr.slice(0, 48).map((raw, i) => {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      const s = String(o['title'] ?? o['name'] ?? o['label'] ?? o['heading'] ?? '').trim();
      return s || `Momento ${i + 1}`;
    }
    return `Momento ${i + 1}`;
  });
}

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

  return {
    phases,
    globalInsights: [
      {
        tone: 'observe',
        text:
          'No pudimos cargar el análisis del servidor. Cuando haya conexión, el recorrido reflejará su borrador y brief sin duplicar lógica aquí.',
      },
    ],
  };
}
