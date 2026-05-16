import type {
  JourneyInsightTone,
  JourneyPhasePreview,
  JourneyPhaseUiState,
  ParticipantJourneyInput,
} from './participant-journey.types';

export interface ParticipantJourneyPreviewModel {
  readonly phases: readonly JourneyPhasePreview[];
  readonly globalInsights: readonly { readonly text: string; readonly tone: JourneyInsightTone }[];
}

const PHASE_defs: readonly {
  id: string;
  title: string;
  baseNarrative: string;
  baseObjective: string;
}[] = [
  {
    id: 'intro',
    title: 'Introducción',
    baseNarrative: 'Por qué participa y qué va a pasar, en pocos minutos claros.',
    baseObjective: 'Generar confianza y contexto antes de preguntas sustantivas.',
  },
  {
    id: 'screening',
    title: 'Selección',
    baseNarrative: 'Confirmar que encaja con quién necesita oír, sin alargarse.',
    baseObjective: 'Asegurar que las respuestas aplican al público correcto.',
  },
  {
    id: 'experience',
    title: 'Experiencia central',
    baseNarrative: 'El momento del estudio: lo vivido, recordado o evaluado.',
    baseObjective: 'Capturar lo que importa para la decisión de negocio.',
  },
  {
    id: 'satisfaction',
    title: 'Valoración',
    baseNarrative: 'Impresión general ya con la experiencia fresca.',
    baseObjective: 'Sintetizar actitud o satisfacción sin adelantar el relato.',
  },
  {
    id: 'demographics',
    title: 'Perfil',
    baseNarrative: 'Datos de perfil; suele funcionar mejor después del tema central.',
    baseObjective: 'Completar segmentación sin cansar antes de tiempo.',
  },
  {
    id: 'close',
    title: 'Cierre',
    baseNarrative: 'Agradecimiento claro y salida limpia.',
    baseObjective: 'Dejar una sensación respetuosa y profesional.',
  },
];

/** Índice de fase 0..5 según título de bloque del instrumento (heurística estable). */
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

/** Extrae títulos de bloques desde `instrument_spec` (blocks | sections | pages | items). */
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
  const fromPayload = briefPayloadTextBlob(input.briefPayload);
  if (fromPayload) {
    chunks.push(fromPayload);
  }
  return chunks.join(' ').toLowerCase();
}

function briefPayloadTextBlob(payload: Record<string, unknown> | null): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  const keys = ['methodology', 'study_type', 'hypothesis', 'constraints', 'notes'];
  const parts: string[] = [];
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === 'string' && v.trim()) {
      parts.push(v.trim());
    }
  }
  return parts.join(' ');
}

function inferSensitiveTopicHint(blob: string): string | null {
  if (!blob) {
    return null;
  }
  if (/onboarding|cuenta|banco|cr[eé]dito|pr[eé]stamo|dinero|tarjeta|fraude/.test(blob)) {
    return 'Temas financieros suelen pedir tono calmado y pocas preguntas sensibles seguidas.';
  }
  if (/salud|clínica|medic|paciente|diagn/.test(blob)) {
    return 'Salud y bienestar suelen requerir especial cuidado en redacción y ritmo.';
  }
  if (/emplead|rrhh|evaluación laboral|encuesta interna/.test(blob)) {
    return 'Temas laborales pueden generar cautela: claridad y anonimato ayudan.';
  }
  return null;
}

function demographicsEarly(blockTitles: readonly string[]): boolean {
  let demoEarly = false;
  blockTitles.forEach((title, idx) => {
    const ix = phaseIndexForBlockTitle(title);
    if (ix === 4 && blockTitles.length >= 4 && idx < Math.floor(blockTitles.length / 2)) {
      demoEarly = true;
    }
  });
  return demoEarly;
}

function earlyPositiveLean(blockTitles: readonly string[]): boolean {
  if (blockTitles.length < 6) {
    return false;
  }
  const half = blockTitles.slice(0, Math.ceil(blockTitles.length / 2));
  return half.some(t => {
    const x = t.toLowerCase();
    return x.includes('satisf') || x.includes('excelente') || x.includes('maravill');
  });
}

/** Línea corta de foco del estudio para cabecera del preview (solo texto existente). */
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
  return 'Cuando el brief y el cuestionario tengan más detalle, este recorrido se alinea solo a su estudio.';
}

export function buildParticipantJourneyPreview(input: ParticipantJourneyInput): ParticipantJourneyPreviewModel {
  const titles = input.blockTitles;
  const hasInstrument = titles.length > 0;
  const blob = trimJoinBrief(input);
  const sensitiveHint = inferSensitiveTopicHint(blob);
  const total = titles.length;
  const counts = [0, 0, 0, 0, 0, 0];
  let rr = 0;
  for (const title of titles) {
    let ix = phaseIndexForBlockTitle(title);
    if (ix < 0) {
      ix = rr % 6;
      rr++;
    }
    counts[ix]++;
  }
  const demoEarly = demographicsEarly(titles);
  const inducedEarly = earlyPositiveLean(titles);
  const heavySurvey = total >= 9;
  const expHeavy = counts[2] >= 4 || (heavySurvey && counts[2] >= 2);

  const globalInsights: { text: string; tone: JourneyInsightTone }[] = [];
  if (hasInstrument && heavySurvey) {
    globalInsights.push({
      tone: 'caution',
      text: 'Hay muchos bloques: si el tiempo con quien responde es corto, conviene priorizar lo que mueve decisión.',
    });
  }
  if (hasInstrument && demoEarly) {
    globalInsights.push({
      tone: 'observe',
      text: 'El perfil aparece muy arriba en el flujo; muchas veces funciona mejor después de la experiencia central.',
    });
  }
  if (hasInstrument && inducedEarly) {
    globalInsights.push({
      tone: 'caution',
      text: 'Hay valoraciones muy positivas antes del relato de experiencia; puede sesgar lo que viene después.',
    });
  }
  if (input.qaLastOk === false) {
    globalInsights.push({
      tone: 'caution',
      text: 'La última revisión automática marcó puntos a mirar en orden o redacción: vale una pasada humana.',
    });
  } else if (input.qaLastOk === true && hasInstrument) {
    globalInsights.push({
      tone: 'bright',
      text: 'La última revisión automática no encontró problemas graves en este borrador.',
    });
  }
  if (input.readinessBlockingFirstCode) {
    globalInsights.push({
      tone: 'caution',
      text: 'Hay un requisito de salida a campo pendiente: revise la revisión y las firmas antes de ejecutar.',
    });
  }

  const phases = PHASE_defs.map((def, phaseIx) => {
    const mappedBlocks = counts[phaseIx];
    const uiState: JourneyPhaseUiState = !hasInstrument
      ? 'waiting'
      : mappedBlocks > 0
        ? 'rich'
        : 'light';

    const signals: string[] = [];
    const insights: { text: string; tone: JourneyInsightTone }[] = [];

    let fatigue: 'baja' | 'media' | 'alta' | null =
      phaseIx === 0 ? 'baja' : phaseIx === 5 ? 'baja' : null;
    let emotional: 'baja' | 'media' | 'alta' | null = null;
    let risk: string | null = null;

    if (phaseIx === 1 && hasInstrument && mappedBlocks > 0) {
      fatigue = 'media';
      risk = 'Aquí suele haber más abandono si la selección es larga o confusa.';
      signals.push('Punto de filtro: las respuestas “no califico” son normales.');
    }
    if (phaseIx === 2 && hasInstrument && mappedBlocks > 0) {
      fatigue = expHeavy ? 'alta' : 'media';
      emotional = sensitiveHint ? 'alta' : 'media';
      risk = sensitiveHint
        ? 'Mayor carga cognitiva y sensibilidad; conviene ritmo pausado.'
        : 'Si hay demasiadas preguntas seguidas, baja la calidad del relato.';
      if (mappedBlocks >= 2) {
        signals.push(`${mappedBlocks} bloques mapeados aquí en su borrador.`);
      }
      if (sensitiveHint) {
        signals.push(sensitiveHint);
      }
    }
    if (phaseIx === 3 && hasInstrument && mappedBlocks > 0) {
      emotional = 'baja';
      fatigue = 'baja';
      if (inducedEarly) {
        insights.push({
          tone: 'caution',
          text: 'Valoración temprana puede influir en cómo cuentan la experiencia después.',
        });
      }
    }
    if (phaseIx === 4 && hasInstrument && mappedBlocks > 0) {
      fatigue = demoEarly ? 'media' : 'baja';
      if (demoEarly) {
        risk = 'Perfil arriba del flujo puede enfriar antes del tema central.';
        insights.push({
          tone: 'observe',
          text: 'Si puede, reserve datos de perfil para después del momento clave.',
        });
      } else {
        signals.push('Colocar perfil al final suele mantener mejor el engagement.');
      }
    }
    if (phaseIx === 5 && hasInstrument && mappedBlocks > 0) {
      signals.push('Cierre claro mejora la sensación de estudio profesional.');
    }

    if (!hasInstrument) {
      insights.push({
        tone: 'observe',
        text:
          'Cuando exista una versión del cuestionario, enlazamos cada momento con los bloques reales — sin inventar contenido.',
      });
    } else if (mappedBlocks === 0) {
      insights.push({
        tone: 'observe',
        text: 'Todavía no hay bloques claros en esta parte del borrador; puede añadirlos o renombrarlos para alinear el relato.',
      });
    }

    if (phaseIx === 2 && blob.includes('fricc')) {
      insights.push({
        tone: 'observe',
        text: 'Si el brief habla de fricción, este tramo es donde debería verse reflejada en las preguntas.',
      });
    }

    const narrative =
      !hasInstrument && blob.length > 30
        ? `${def.baseNarrative} Su brief ya orienta el tono; falta reflejarlo en bloques del instrumento.`
        : def.baseNarrative;

    const blockObjective =
      mappedBlocks > 0
        ? `${def.baseObjective} (${mappedBlocks} bloque${mappedBlocks === 1 ? '' : 's'} reconocido${mappedBlocks === 1 ? '' : 's'} en esta etapa.)`
        : def.baseObjective;

    return {
      id: def.id,
      title: def.title,
      narrative,
      blockObjective,
      expectedRisk: risk,
      fatiguePotential: fatigue,
      emotionalSensitivity: emotional,
      automaticSignals: signals,
      contextualInsights: insights,
      uiState,
    };
  });

  return { phases, globalInsights };
}
