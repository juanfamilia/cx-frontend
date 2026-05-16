import { FieldRiskUiLevel } from './components/field-risk-badge.component';
import { FieldMetric, FieldProjectOverviewRow } from './field.service';

export function healthToRiskLevel(health: FieldProjectOverviewRow['health']): FieldRiskUiLevel {
  if (health === 'red') {
    return 'high';
  }
  if (health === 'amber') {
    return 'medium';
  }
  return 'low';
}

/** completion_rate del overview viene como fracción 0–1 en MVP backend. */
export function formatCompletionRatePct(row: FieldProjectOverviewRow): string {
  const m = row.kpis_latest?.find(k => k.metric_code === 'completion_rate');
  if (!m) {
    return '—';
  }
  const v = m.value;
  const pct = v <= 1 ? Math.round(v * 100) : Math.round(v);
  return `${pct}%`;
}

export function getLatestMetricValue(metrics: FieldMetric[] | undefined, code: string): number | null {
  const m = metrics?.find(k => k.metric_code === code);
  return m != null ? m.value : null;
}

/** Texto ejecutivo para el semáforo de salud (sin exponer códigos crudos). */
export function healthExecutiveLabel(health: FieldProjectOverviewRow['health'] | undefined | null): string {
  if (health === 'green') {
    return 'Dentro de lo esperado';
  }
  if (health === 'amber') {
    return 'Requiere atención';
  }
  if (health === 'red') {
    return 'Requiere acción';
  }
  return '—';
}

/** Conteo de hallazgos abiertos por severidad en la fila de overview. */
export function openSeverityCount(row: FieldProjectOverviewRow | null | undefined, severity: string): number {
  const raw = row?.findings_open_by_severity?.[severity];
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
}

/** Mensaje corto para el tablero: qué hacer ahora. */
export function operationalNextStepHint(row: FieldProjectOverviewRow | null | undefined): string {
  if (!row) {
    return '—';
  }
  const critical = openSeverityCount(row, 'error');
  const warn = openSeverityCount(row, 'warn');
  const pending = row.findings_pending_review ?? 0;
  if (row.health === 'red' || critical > 0) {
    return `Primero: revise hallazgos críticos (${critical}).`;
  }
  if (row.health === 'amber' || warn > 0) {
    return `${warn} advertencia(s) abierta(s): vale una pasada en equipo.`;
  }
  if (pending > 0) {
    return `${pending} tema(s) pendientes en la lista.`;
  }
  return 'Todo tranquilo por aquí. Mantenga el instrumento al día antes de campo.';
}

/** Señal cruda `health_reasons` del overview → lenguaje operacional (la original sigue disponible en UI secundaria). */
export function executiveHealthReason(raw: string): string {
  const r = raw.trim();
  if (!r) {
    return r;
  }

  const exact: Record<string, string> = {
    'Último análisis Field (motor automático) terminó en fallo.':
      'Riesgo operativo: el último análisis automático falló. Revise fuentes y vuelva a ejecutar.',
    'Hay fuentes Dooblo activas pero falta ID de encuesta en el vínculo.':
      'Bloqueo de ingestión: falta vincular el ID de encuesta en SurveyToGo.',
    'Sin sincronización de ejecución reciente (más de 7 días o nunca).':
      'Pendiente operativo: sincronización de ejecución antigua o inexistente (más de 7 días).',
    'Hay fuentes Qualtrics activas pero falta ID de encuesta (SV_…) en el vínculo.':
      'Bloqueo de ingestión: falta ID de encuesta Qualtrics en el vínculo.',
    'Cuota en SurveyToGo: respuesta upstream no OK en último snapshot.':
      'Consistencia de campo: cuota no confirmada correctamente en el último snapshot SurveyToGo.',
  };
  const mapped = exact[r];
  if (mapped) {
    return mapped;
  }

  const crit = /^(\d+) hallazgo\(s\) crítico\(s\) sin cerrar \(error\)\.$/.exec(r);
  if (crit) {
    return `Riesgo: ${crit[1]} hallazgo(s) crítico(s) abiertos sin cerrar.`;
  }

  const warn = /^(\d+) advertencia\(s\) operativa\(s\) abiertas\.$/.exec(r);
  if (warn) {
    return `Atención: ${warn[1]} advertencia(s) operativa(s) abiertas.`;
  }

  const pend = /^(\d+) hallazgo\(s\) pendientes de revisión\/aprobación\.$/.exec(r);
  if (pend) {
    return `Pendiente operativo: ${pend[1]} hallazgo(s) pendientes de revisión o aprobación.`;
  }

  const av = /^Avance muestral bajo \(\~(\d+)% vs objetivo declarado\)\.$/.exec(r);
  if (av) {
    return `Riesgo de muestra: avance ~${av[1]}% respecto al objetivo declarado (por debajo del umbral).`;
  }

  return r;
}

/** Rol en readiness / firmas → etiqueta para cuenta operativa. */
export function executiveStakeholderRole(role: string): string {
  const x = (role || '').toLowerCase();
  if (x.includes('research')) {
    return 'Investigación';
  }
  if (x.includes('qa')) {
    return 'Control de calidad';
  }
  if (x.includes('account')) {
    return 'Cuenta / proyecto';
  }
  return role;
}

/** Bloqueos operativos → lenguaje claro en superficie (detalle técnico queda abajo). */
export function executiveReadinessBlocking(code: string): string {
  const map: Record<string, string> = {
    brief_not_approved: 'Falta cerrar el brief como lo pide su empresa.',
    revision_archived: 'Esta versión está archivada; trabaje sobre una versión activa.',
    schema_validation_missing: 'Falta una revisión automática del cuestionario.',
    schema_validation_failed: 'La última revisión automática marcó puntos por corregir.',
    schema_validation_stale: 'Hubo cambios después de la última revisión automática.',
    qa_run_missing: 'Falta una revisión de calidad según su proceso.',
    qa_stop_present: 'Hay temas de calidad marcados como prioritarios.',
    qa_fix_now_present: 'Hay temas de calidad que piden acción inmediata.',
    signatory_grants_not_loaded: 'No pudimos cargar las firmas configuradas.',
  };
  if (map[code]) {
    return map[code];
  }
  const m = /^no_signatories_for_(.+)$/.exec(code);
  if (m) {
    return `Faltan firmantes configurados para: ${executiveStakeholderRole(m[1])}.`;
  }
  return code.replace(/_/g, ' ');
}

export interface QaConsistencySnapshot {
  last_validation_ok: boolean | null;
  last_validation_at: string | null;
  last_validation_issue_count: number | null;
  last_ruleset_version?: string | null;
}

/** Mensaje único para consistencia / QA de una revisión (sin jerga de runtime). */
export function executiveQaConsistencySummary(d: QaConsistencySnapshot): string {
  if (d.last_validation_ok === false) {
    const n = d.last_validation_issue_count;
    return n != null
      ? `Consistencia: la última revisión automática no superada (${n} incidencias registradas).`
      : 'Consistencia: la última revisión automática no fue superada.';
  }
  if (d.last_validation_ok === true) {
    return d.last_ruleset_version
      ? `Consistencia correcta · paquete de reglas ${d.last_ruleset_version}.`
      : 'Consistencia correcta en la última revisión automática.';
  }
  if (d.last_validation_at) {
    return 'Hay una revisión automática registrada; confirme el resultado en su flujo operativo.';
  }
  return 'Sin resultado de revisión de consistencia / control de calidad en esta revisión todavía.';
}

/** Superficie guiada PRE-FIELD: sin IDs de paquetes, reglas ni runtime en el mensaje. */
export function executiveQaConsistencySummaryGuided(d: QaConsistencySnapshot): string {
  if (d.last_validation_ok === false) {
    const n = d.last_validation_issue_count;
    return n != null
      ? `Recomendaciones: ${n} punto(s) detectado(s) en la última revisión automática.`
      : 'La última revisión automática sugiere dar una pasada antes de publicar.';
  }
  if (d.last_validation_ok === true) {
    return 'Última revisión automática: sin alertas graves.';
  }
  if (d.last_validation_at) {
    return 'Hay una revisión reciente; confirme en «Revisión» que coincide con lo que quiere en campo.';
  }
  return 'Aún no hay revisión automática registrada para esta versión.';
}

/**
 * PRE-FIELD solo para proyectos nuevos: borrador y sin operación/campo iniciada.
 * Usar cuando solo se tiene `FieldProject` (p. ej. listado plano de proyectos).
 */
export function fieldProjectAllowsPrefield(
  project: {
    status?: string | null;
    last_execution_sync_at?: string | null;
  } | null | undefined
): boolean {
  if (project == null) {
    return true;
  }
  if ((project.status ?? '').trim().toLowerCase() !== 'draft') {
    return false;
  }
  const sync = project.last_execution_sync_at;
  if (sync != null && String(sync).trim() !== '') {
    return false;
  }
  return true;
}

/** Subconjunto de overview necesario para la puerta PRE-FIELD. */
export type FieldOverviewPrefieldSignals = {
  project: { status?: string | null; last_execution_sync_at?: string | null };
  surveys_linked_count?: number;
  last_csv_import_at?: string | null;
};

/** Misma regla con señales del overview (encuestas vinculadas, import CSV). */
export function fieldOverviewAllowsPrefield(row: FieldOverviewPrefieldSignals | null | undefined): boolean {
  if (row == null) {
    return true;
  }
  if (!fieldProjectAllowsPrefield(row.project)) {
    return false;
  }
  if ((row.surveys_linked_count ?? 0) > 0) {
    return false;
  }
  const csvAt = row.last_csv_import_at;
  if (csvAt != null && String(csvAt).trim() !== '') {
    return false;
  }
  return true;
}

/** Etiqueta legible para filas de KPI en scoring. */
export function metricCodeExecutiveLabel(metricCode: string): string {
  const c = (metricCode || '').trim();
  switch (c) {
    case 'completion_rate':
      return 'Avance muestral (proxy)';
    default:
      return c.replace(/_/g, ' ') || '—';
  }
}
