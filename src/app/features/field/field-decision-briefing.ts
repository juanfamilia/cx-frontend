import type { FieldFinding, FieldImportRun } from './field.service';

/**
 * Copy alineado a "tomador de decisión": qué puede alargar campo, re-trabajo o
 * debilidad del levantamiento (sin sustituir juicio de muestreo/cuota/GPS cuando existan en datos).
 */

/** Código de hallazgo de backend o fallback genérico. */
const STAKEHOLDER_RISK: Record<string, string> = {
  ROW_INCOMPLETE:
    'Riesgo para el análisis: faltan datos mínimos y partes de la tanda pueden quedar poco defensables frente a mandante o auditoría.',
  DUPLICATE_CASE:
    'Riesgo operativo: casos dobles alargan limpieza, sesgan cierre por celda o generan dudas en facturación y entrega al cliente.',
  INVALID_DURATION:
    'Riesgo de coherencia: tiempos imposibles o vacíos afectan costos, tiempos de entrevistador o la lectura de productividad en terreno.',
  DOOBLO_QUOTA_UPSTREAM:
    'Riesgo de planificación: sin estado de cuota fiable no se puede defender avance por celda frente a mandante o auditoría.',
  DOOBLO_SURVEY_INTERVIEW_IDS_UPSTREAM:
    'Riesgo de visibilidad: sin IDs de entrevista no se audita duración ni patrones en la muestra Dooblo desde esta corrida.',
  DOOBLO_OPERATIONDATA_UPSTREAM:
    'Riesgo de QA: no se pudieron leer filas operativas para la muestra; conviene validar API o formato antes de asumir cobertura.',
  DOOBLO_RESPONSE_QUALITY_NO_TABULAR_ROWS:
    'Riesgo técnico: el export no llegó como tabla JSON reconocible; las señales de superficie no corrieron en esta corrida.',
  DOOBLO_RESPONSE_QUALITY_EMPTY_SAMPLE:
    'Riesgo operativo: la cuenta API no devolvió IDs de entrevista utilizables para auditar la muestra tabular.',
  DOOBLO_GPS_NO_COORDINATES_IN_TABULAR:
    'Riesgo de trazabilidad: el export no incluye columnas GPS reconocibles en la muestra; no hay señal de ubicación desde datos.',
  QUOTA_MAX_DEVIATION:
    'Riesgo de muestra: desvíos fuera de política pueden invalidar inferencias por celda o generar retrabajo de ponderación.',
  FIELD_DURATION_ANOMALY:
    'Riesgo de coherencia: duraciones fuera de rango en muestra sugieren revisión de tiempos de campo o configuración de survey.',
  FIELD_STRAIGHT_LINING:
    'Riesgo de calidad de respuesta: muchas filas con patrones homogéneos pueden indicar falta de compromiso o errores de captura.',
  FIELD_GPS_INCONSISTENT:
    'Riesgo de credibilidad: coordenadas fuera de rango o puntos válidos muy alejados dentro del mismo caso debilitan la defensa del dato en terreno.',
  FIELD_FALSIFICATION_POTENTIAL:
    'Riesgo de integridad: señales de superficie sugieren revisión focalizada antes de asumir cierre.',
};

const DEFAULT_RISK = 'Riesgo operativo: conviene alinear criterio con terreno o datos de origen antes de cerrar.';

/**
 * Título de una línea debajo de la etiqueta de categoría (por código de hallazgo).
 */
export function decisionRiskLine(findingCode: string): string {
  return STAKEHOLDER_RISK[findingCode] ?? DEFAULT_RISK;
}

/**
 * Mensaje de una sola frase, encima del listado, según el estado de la última corrida.
 */
export function decisionExecutiveLine(
  run: FieldImportRun | null,
  findings: FieldFinding[]
): string | null {
  if (run == null) {
    return null;
  }
  if (run.status === 'failed') {
    return 'Esta carga no puede usarse en el tablero hasta corregir el origen: sin archivo válido no hay luz verde de seguimiento.';
  }
  if (run.status === 'processing') {
    return null;
  }
  const err = findings.filter(f => f.severity === 'error').length;
  const warn = findings.filter(f => f.severity === 'warn').length;
  if (err > 0) {
    return `Hay ${err} aviso(s) que requieren acción: sin resolverlos se arriesga alargar campo, re-trabajo o cuestionamiento del levantamiento.`;
  }
  if (warn > 0) {
    return `Hay ${warn} aviso(s) a validar: conviene alinear criterio con terreno o dirección de estudio antes de asumir cierre.`;
  }
  if (run.status === 'completed') {
    return 'Sin avisos automáticos en los datos de esta carga. Muestreo, cuota y riesgo en terreno requieren criterio de estudio y de mandante; Field no reemplaza ese control.';
  }
  return null;
}
