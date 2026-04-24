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
