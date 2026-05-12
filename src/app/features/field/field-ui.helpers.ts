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

/** Mensaje corto orientado a acción para la vista tablero. */
export function operationalNextStepHint(row: FieldProjectOverviewRow | null | undefined): string {
  if (!row) {
    return '—';
  }
  const critical = openSeverityCount(row, 'error');
  const warn = openSeverityCount(row, 'warn');
  const pending = row.findings_pending_review ?? 0;
  if (row.health === 'red' || critical > 0) {
    return `Prioridad: revise los hallazgos críticos abiertos (${critical}). Use la tabla de prioridades o la lista completa.`;
  }
  if (row.health === 'amber' || warn > 0) {
    return `Salud en observación: ${warn} advertencia(s) abierta(s). Complemente con métricas y sincronización si aplica.`;
  }
  if (pending > 0) {
    return `${pending} elemento(s) pendiente(s) de revisión en la lista operativa de hallazgos.`;
  }
  return 'Sin bloqueos críticos visibles aquí. Mantenga sincronización periódica y el instrumento al día en PRE-FIELD.';
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

/** Código de bloqueo Readiness → mensaje operacional (código sigue mostrándose aparte). */
export function executiveReadinessBlocking(code: string): string {
  const map: Record<string, string> = {
    brief_not_approved: 'Brief sin la aprobación exigida por su empresa.',
    revision_archived: 'La revisión metodológica está archivada.',
    schema_validation_missing: 'Falta comprobación de consistencia del cuestionario.',
    schema_validation_failed: 'La comprobación de consistencia del cuestionario no fue superada.',
    schema_validation_stale:
      'La comprobación de consistencia está desactualizada respecto al contenido actual.',
    qa_run_missing: 'Falta una corrida de control de calidad cuando la política la exige.',
    qa_stop_present: 'Hay hallazgos de control de calidad tipo «stop» pendientes.',
    qa_fix_now_present: 'Hay hallazgos de control de calidad «acción inmediata» pendientes.',
    signatory_grants_not_loaded: 'No se pudieron cargar los permisos de firmas.',
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
