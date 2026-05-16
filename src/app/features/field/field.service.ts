import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/** Origen principal declarado al crear el proyecto (tablero Field). */
export type FieldIngestMode = 'csv' | 'dooblo' | 'qualtrics';

export interface FieldProject {
  id: number;
  company_id: number;
  client_id: number;
  /** Estudio asociado al proyecto (opcional en proyectos antiguos sin estudio). */
  study_id?: number | null;
  name: string;
  description: string | null;
  import_format_version: string;
  status: string;
  /** csv: archivo; dooblo: SurveyToGo; qualtrics: XM API v3. */
  ingest_mode?: FieldIngestMode;
  /** Metadatos operativos (p. ej. sample_target). */
  execution_metadata?: Record<string, unknown>;
  last_execution_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldProjectCreateBody {
  name: string;
  description?: string | null;
  client_id: number;
  company_id?: number | null;
  ingest_mode?: FieldIngestMode;
  /** field_studies.id misma empresa y mismo client_id que el proyecto. */
  study_id?: number | null;
}

/** PATCH parcial (solo campos enviados). */
export interface FieldProjectPatchBody {
  study_id?: number | null;
}

/** Estudio canónico 7Field (tenant-scoped). */
export interface FieldStudy {
  id: number;
  company_id: number;
  client_id: number;
  name: string;
  description: string | null;
  status: string;
  primary_language?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldStudyCreateBody {
  name: string;
  description?: string | null;
  client_id: number;
  company_id?: number | null;
}

/** Catálogo Framework Library (`GET /field/framework-templates`). */
export interface FieldFrameworkTemplate {
  id: number;
  slug: string;
  study_type: string;
  framework_version: string;
  title: string;
  description: string | null;
  coverage_rules: Record<string, unknown>;
  stub_spec_json: Record<string, unknown> | null;
  sort_order: number;
  is_active: boolean;
}

/** Revisión `instrument_spec` (lista / metadatos). */
export interface FieldInstrumentRevision {
  id: number;
  study_id: number;
  company_id: number;
  revision_label: string;
  status: string;
  framework_template_id: string | null;
  notes: string | null;
  title: string | null;
  instrument_spec_version_declared: string | null;
  content_hash: string;
  last_validation_at: string | null;
  last_validation_ok: boolean | null;
  last_validation_issue_count: number | null;
  last_validation_content_hash: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: number | null;
  updated_by_user_id: number | null;
  /** Hash del brief vigente al crear la revisión (lineage). */
  brief_snapshot_hash?: string;
  /** Versión catálogo framework efectiva. */
  framework_catalog_version?: string | null;
  /** Último ruleset QA ejecutado sobre esta revisión. */
  last_ruleset_version?: string | null;
}

export interface FieldInstrumentRevisionCreateBody {
  spec?: Record<string, unknown> | null;
  revision_label?: string | null;
  framework_template_id?: string | null;
  framework_template_slug?: string | null;
  framework_template_version?: string | null;
  notes?: string | null;
}

/** Detalle API: metadatos + `instrument_spec` completo (`GET .../instrument-revisions/{id}`). */
export interface FieldInstrumentRevisionWithSpec extends FieldInstrumentRevision {
  spec: Record<string, unknown>;
}

/** Brief PRE-FIELD ligado al estudio. */
export interface FieldStudyBriefPublic {
  study_id: number;
  company_id: number;
  payload_json: Record<string, unknown>;
  completeness_score: number | null;
  approval_state: string;
  approved_internal_user_id: number | null;
  approved_internal_at: string | null;
  approved_client_user_id: number | null;
  approved_client_at: string | null;
  body_hash: string;
  updated_at: string;
}

export interface FieldStudyBriefPatchBody {
  payload?: Record<string, unknown>;
  completeness_score?: number | null;
}

export interface FieldFrameworkWaiverPublic {
  id: number;
  instrument_revision_id: number;
  company_id: number;
  rationale: string;
  waived_sections_json: unknown[] | Record<string, unknown> | null;
  created_at: string;
  created_by_user_id: number | null;
}

export interface FieldFrameworkWaiverCreateBody {
  rationale: string;
  waived_sections?: unknown[] | Record<string, unknown> | null;
}

/** Política Readiness L4. */
export interface FieldReadinessPolicyPublic {
  company_id: number;
  require_role_research: boolean;
  require_role_qa: boolean;
  require_role_account: boolean;
  block_on_schema_invalid: boolean;
  block_on_missing_schema_validation: boolean;
  block_on_qa_stop: boolean;
  block_on_qa_fix_now: boolean;
  require_qa_run: boolean;
  enforce_signatory_grants: boolean;
  require_brief_approved: boolean;
}

export interface FieldReadinessGatePublic {
  revision_id: number;
  revision_status: string;
  aggregate_status: string;
  blocking_codes: string[];
  missing_roles: string[];
  stale_roles: string[];
  required_roles: string[];
  policy: FieldReadinessPolicyPublic;
  last_validation_ok: boolean | null;
  content_hash: string;
  latest_qa_run_id: number | null;
  qa_stop_count: number | null;
  qa_fix_now_count: number | null;
  signatures: Array<{
    id: number;
    revision_id: number;
    signature_role: string;
    signer_user_id: number;
    signed_at: string;
    comment?: string | null;
    snapshot_spec_hash: string;
    snapshot_qa_run_id: number | null;
  }>;
}

/** Respuesta `GET .../instrument-revisions/{id}/study-intelligence` (motor backend). */
export interface StudyIntelligenceJourneyPhasePublic {
  phase_key: string;
  order_index: number;
  title: string;
  narrative_summary?: string | null;
  block_ids: string[];
}

export interface StudyIntelligenceParticipantJourneyPublic {
  study_id: number;
  instrument_revision_id: number;
  brief_snapshot_hash?: string | null;
  instrument_spec_content_hash?: string | null;
  framework_catalog_version?: string | null;
  phases: StudyIntelligenceJourneyPhasePublic[];
}

export interface StudyIntelligenceOperationalRiskPublic {
  code: string;
  message_human: string;
  severity: string;
  linked_block_id?: string | null;
  linked_item_id?: string | null;
  source_rule_id?: string | null;
}

export interface StudyIntelligenceMethodologicalSignalPublic {
  code: string;
  message_human: string;
  severity: string;
  linked_block_id?: string | null;
  framework_rule_ref?: string | null;
}

export interface StudyIntelligenceFatigueRiskPublic {
  code: string;
  message_human: string;
  level: string;
  linked_block_id?: string | null;
}

export interface StudyIntelligenceSensitivityAreaPublic {
  code: string;
  label_human: string;
  rationale_human: string;
  linked_block_ids: string[];
}

export interface StudyIntelligenceExpectedDropoutZonePublic {
  phase_key?: string | null;
  linked_block_id?: string | null;
  message_human: string;
  confidence?: string | null;
}

export interface StudyIntelligenceInsightCardPublic {
  insight_id: string;
  headline: string;
  body: string;
  priority: string;
  tone?: string;
  trace_rule_ids: string[];
  trace_heuristic_ids: string[];
}

export interface StudyIntelligenceBundlePublic {
  engine_version: string;
  ruleset_versions: string[];
  /** Fila `field_participant_journeys` tras persistir snapshot (si hubo éxito). */
  participant_journey_snapshot_id?: number | null;
  participant_journey?: StudyIntelligenceParticipantJourneyPublic | null;
  operational_risks: StudyIntelligenceOperationalRiskPublic[];
  methodological_signals: StudyIntelligenceMethodologicalSignalPublic[];
  fatigue_risks: StudyIntelligenceFatigueRiskPublic[];
  sensitivity_areas: StudyIntelligenceSensitivityAreaPublic[];
  expected_dropout_zones: StudyIntelligenceExpectedDropoutZonePublic[];
  insight_cards: StudyIntelligenceInsightCardPublic[];
  contextual_scores: Record<string, unknown>;
}

export interface FieldImportRun {
  id: number;
  field_project_id: number;
  status: string;
  format_version: string;
  error_detail: string | null;
  row_count: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface FieldImportRow {
  id: number;
  field_project_id: number;
  field_import_run_id: number;
  source_row_number: number;
  case_id: string;
  wave_id: string;
  interviewer_id: string;
  disposition: string;
  started_at_text: string | null;
  completed_at_text: string | null;
  duration_sec: number | null;
  extras: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Hallazgo Field (import / capa de decisión), alineado con FieldFindingPublic en la API.
 */
export interface FieldFinding {
  id: number;
  field_project_id: number;
  field_import_run_id: number | null;
  field_sync_run_id: number | null;
  field_policy_set_id: number | null;
  field_import_row_id: number | null;
  idempotency_key: string | null;
  source: string | null;
  code: string;
  severity: string;
  case_id: string | null;
  wave_id: string | null;
  message: string;
  explanation: string | null;
  recommendation: string | null;
  evidence: Record<string, unknown> | null;
  approval_status: string | null;
  reviewed_by_user_id: number | null;
  reviewed_at: string | null;
  operational_criticality?: string | null;
  operational_gate?: string | null;
  rule_configuration_version_id?: number | null;
  created_at: string;
}

export type FieldDecisionFinding = FieldFinding;

export interface FieldFindingApprovalBody {
  status: 'approved' | 'rejected' | 'pending';
  note?: string | null;
}

export interface FieldFindingDecisionLog {
  id: number;
  company_id: number;
  field_project_id: number;
  field_finding_id: number;
  actor_user_id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
  /** Nombre + apellido o email del actor (si la API lo envía). */
  actor_display?: string | null;
}

export interface FieldLedgerEvent {
  id: number;
  field_project_id: number;
  field_import_run_id: number | null;
  actor_user_id: number | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

/** Configuración Dooblo/ SurveyToGo por empresa (sin contraseña en lectura). */
export interface DoobloCompanyConfig {
  company_id: number;
  configured: boolean;
  dooblo_configured?: boolean;
  source: 'company' | 'env' | 'none';
  base_url: string;
  api_user: string | null;
  has_password: boolean;
  updated_at: string | null;
}

export interface QualtricsCompanyConfig {
  company_id: number;
  configured: boolean;
  qualtrics_configured?: boolean;
  base_url: string | null;
  has_api_token: boolean;
  updated_at: string | null;
  api_probe_ok?: boolean | null;
  api_probe_status?: number | null;
  api_probe_error?: string | null;
}

export interface QualtricsCredentialsPut {
  base_url?: string | null;
  api_token?: string | null;
}

export interface DoobloCredentialsPut {
  base_url?: string | null;
  api_user?: string | null;
  password?: string | null;
}

/** Ítem del catálogo remoto (picker Dooblo / futuros conectores). */
export interface RemoteFieldCatalogItem {
  external_id: string;
  title: string;
  kind: string;
  /** Presente cuando el ítem viene de agregación org-wide (SurveyToGo). */
  studio_customer_id?: string | null;
  studio_customer_name?: string | null;
}

export interface RemoteFieldCatalogPage {
  provider: string;
  items: RemoteFieldCatalogItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
  query_applied: string | null;
}

export interface DoobloFailedCustomer {
  customer_id: string;
  customer_name?: string | null;
  reason: string;
}

/** Respuesta del barrido org. (Customers × CustomerProjects); `items` = proyectos Studio. */
export interface OrganizationStudioProjectsCatalogPage extends RemoteFieldCatalogPage {
  failed_customers?: DoobloFailedCustomer[];
}

/** Mapeo proyecto Field → SurveyToGo/Dooblo. */
export interface FieldProjectExternalSource {
  id: number;
  field_project_id: number;
  company_id: number;
  source_type: string;
  external_project_id: string | null;
  external_survey_id: string | null;
  external_customer_id: string | null;
  wave_id: string | null;
  is_active: boolean;
  sync_strategy: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldProjectExternalSourceCreate {
  source_type: string;
  external_project_id?: string | null;
  external_survey_id?: string | null;
  external_customer_id?: string | null;
  wave_id?: string | null;
  is_active?: boolean;
  sync_strategy?: string | null;
}

export interface DoobloAnalyzeBody {
  idempotency_key: string;
  field_project_external_source_id?: number | null;
  field_policy_set_id?: number | null;
}

/** Corrida de capa de decisión (incl. análisis Dooblo async). */
export interface FieldSyncRun {
  id: number;
  field_project_id: number;
  company_id: number;
  run_kind: string;
  idempotency_key: string;
  field_project_external_source_id: number | null;
  field_import_run_id: number | null;
  field_policy_set_id: number | null;
  status: string;
  error_summary: string | null;
  total_records: number | null;
  context_payload: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
}

/** KPI materializado (sync / pipeline Field). */
export interface FieldMetric {
  id: number;
  field_project_id: number;
  metric_code: string;
  value: number;
  calculated_at: string;
  dimensions?: Record<string, unknown> | null;
}

/** Snapshot operativo (cuota, calidad tabular, GPS, etc.). */
export interface FieldOperationalSnapshot {
  id: number;
  field_project_id: number;
  field_sync_run_id: number | null;
  field_policy_set_id: number | null;
  quotas_state: Record<string, unknown> | null;
  gps_state: Record<string, unknown> | null;
  route_flags: Record<string, unknown> | null;
  field_status: Record<string, unknown> | null;
  last_calculated_at: string | null;
}

export interface FieldProjectSyncResponse {
  field_project_id: number;
  surveys_upserted: number;
  metrics_emitted: string[];
  partial_errors: Record<string, unknown>[];
}

/** Fila del GET /field/projects/overview (centro de mando). */
export interface FieldProjectOverviewRow {
  project: FieldProject;
  /** Clave operativa (external_ref) o nombre de cuenta; ver backend. */
  client_display_name: string;
  /** Nombre de cuenta / marca (end_clients.name) cuando el vínculo es válido. */
  client_name?: string | null;
  /** Referencia externa del cliente final (end_clients.external_ref). */
  client_external_ref?: string | null;
  study_display_name: string | null;
  kpis_latest: FieldMetric[];
  findings_open_by_severity: Record<string, number>;
  findings_pending_review: number;
  surveys_linked_count: number;
  active_dooblo_sources: number;
  dooblo_sources_with_survey_id: number;
  active_qualtrics_sources?: number;
  qualtrics_sources_with_survey_id?: number;
  last_analysis_run_status: string | null;
  last_analysis_run_at: string | null;
  last_csv_import_status: string | null;
  last_csv_import_at: string | null;
  operational_snapshot_at: string | null;
  health: 'green' | 'amber' | 'red';
  health_reasons: string[];
  quota_upstream_ok: boolean | null;
  tabular_row_count: number | null;
  /** Presente en GET /projects/{id}/overview; en listado multi-proyecto suele ir vacío. */
  top_findings?: FieldFinding[];
}

export interface EndClient {
  id: number;
  company_id: number;
  name: string;
  external_ref: string | null;
  notes: string | null;
}

export interface EndClientCreateBody {
  name: string;
  external_ref?: string | null;
  notes?: string | null;
  company_id?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private readonly http = inject(HttpClient);

  listProjects(companyId?: number | null, clientId?: number | null): Observable<FieldProject[]> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    if (clientId != null && Number.isFinite(clientId)) {
      params = params.set('client_id', String(clientId));
    }
    return this.http.get<FieldProject[]>(environment.apiUrl + 'field/projects', {
      params,
    });
  }

  /** Resumen multi-proyecto con semáforo y KPIs (tablero ejecutivo). */
  listProjectsOverview(
    companyId: number,
    clientId?: number | null
  ): Observable<FieldProjectOverviewRow[]> {
    let params = new HttpParams().set('company_id', String(companyId));
    if (clientId != null && Number.isFinite(clientId)) {
      params = params.set('client_id', String(clientId));
    }
    return this.http.get<FieldProjectOverviewRow[]>(
      `${environment.apiUrl}field/projects/overview`,
      { params }
    );
  }

  /** Drill-down (clic 3): misma fila que overview + top_findings abiertos. */
  getProjectOverview(projectId: number, topFindingsLimit = 12): Observable<FieldProjectOverviewRow> {
    const params = new HttpParams().set(
      'top_findings_limit',
      String(Math.max(0, Math.min(50, topFindingsLimit)))
    );
    return this.http.get<FieldProjectOverviewRow>(
      `${environment.apiUrl}field/projects/${projectId}/overview`,
      { params }
    );
  }

  getOperationalSnapshot(projectId: number): Observable<FieldOperationalSnapshot | null> {
    return this.http.get<FieldOperationalSnapshot | null>(
      `${environment.apiUrl}field/projects/${projectId}/operational-snapshot`
    );
  }

  postExecutionSync(projectId: number): Observable<FieldProjectSyncResponse> {
    return this.http.post<FieldProjectSyncResponse>(
      `${environment.apiUrl}field/projects/${projectId}/sync`,
      {}
    );
  }

  createProject(body: FieldProjectCreateBody): Observable<FieldProject> {
    return this.http.post<FieldProject>(environment.apiUrl + 'field/projects', body);
  }

  patchProject(projectId: number, body: FieldProjectPatchBody): Observable<FieldProject> {
    return this.http.patch<FieldProject>(
      `${environment.apiUrl}field/projects/${projectId}`,
      body
    );
  }

  listStudies(companyId?: number | null, clientId?: number | null): Observable<FieldStudy[]> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    if (clientId != null && Number.isFinite(clientId)) {
      params = params.set('client_id', String(clientId));
    }
    return this.http.get<FieldStudy[]>(environment.apiUrl + 'field/studies', { params });
  }

  createStudy(body: FieldStudyCreateBody): Observable<FieldStudy> {
    return this.http.post<FieldStudy>(environment.apiUrl + 'field/studies', body);
  }

  /** Plantillas metodológicas PRE-FIELD (opcional filtro por `study_type` del schema). */
  listFrameworkTemplates(studyType?: string | null): Observable<FieldFrameworkTemplate[]> {
    let params = new HttpParams();
    const st = studyType?.trim().toLowerCase();
    if (st) {
      params = params.set('study_type', st);
    }
    return this.http.get<FieldFrameworkTemplate[]>(
      `${environment.apiUrl}field/framework-templates`,
      { params }
    );
  }

  listInstrumentRevisions(
    studyId: number,
    companyId?: number | null
  ): Observable<FieldInstrumentRevision[]> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldInstrumentRevision[]>(
      `${environment.apiUrl}field/studies/${studyId}/instrument-revisions`,
      { params }
    );
  }

  createInstrumentRevision(
    studyId: number,
    body: FieldInstrumentRevisionCreateBody,
    companyId?: number | null
  ): Observable<FieldInstrumentRevision> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.post<FieldInstrumentRevision>(
      `${environment.apiUrl}field/studies/${studyId}/instrument-revisions`,
      body,
      { params }
    );
  }

  /** Borrador completo con JSON `instrument_spec`. */
  getInstrumentRevision(
    revisionId: number,
    companyId?: number | null
  ): Observable<FieldInstrumentRevisionWithSpec> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldInstrumentRevisionWithSpec>(
      `${environment.apiUrl}field/instrument-revisions/${revisionId}`,
      { params }
    );
  }

  getStudyBrief(studyId: number, companyId?: number | null): Observable<FieldStudyBriefPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldStudyBriefPublic>(
      `${environment.apiUrl}field/studies/${studyId}/brief`,
      { params }
    );
  }

  patchStudyBrief(
    studyId: number,
    body: FieldStudyBriefPatchBody,
    companyId?: number | null
  ): Observable<FieldStudyBriefPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.patch<FieldStudyBriefPublic>(
      `${environment.apiUrl}field/studies/${studyId}/brief`,
      body,
      { params }
    );
  }

  approveStudyBriefInternal(studyId: number, companyId?: number | null): Observable<FieldStudyBriefPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.post<FieldStudyBriefPublic>(
      `${environment.apiUrl}field/studies/${studyId}/brief/approve-internal`,
      {},
      { params }
    );
  }

  approveStudyBriefClient(studyId: number, companyId?: number | null): Observable<FieldStudyBriefPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.post<FieldStudyBriefPublic>(
      `${environment.apiUrl}field/studies/${studyId}/brief/approve-client`,
      {},
      { params }
    );
  }

  listFrameworkWaivers(
    revisionId: number,
    companyId?: number | null
  ): Observable<FieldFrameworkWaiverPublic[]> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldFrameworkWaiverPublic[]>(
      `${environment.apiUrl}field/instrument-revisions/${revisionId}/framework-waivers`,
      { params }
    );
  }

  createFrameworkWaiver(
    revisionId: number,
    body: FieldFrameworkWaiverCreateBody,
    companyId?: number | null
  ): Observable<FieldFrameworkWaiverPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.post<FieldFrameworkWaiverPublic>(
      `${environment.apiUrl}field/instrument-revisions/${revisionId}/framework-waivers`,
      body,
      { params }
    );
  }

  getReadinessPolicy(companyId?: number | null): Observable<FieldReadinessPolicyPublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldReadinessPolicyPublic>(
      `${environment.apiUrl}field/readiness-policy`,
      { params }
    );
  }

  getReadinessForRevision(
    revisionId: number,
    companyId?: number | null
  ): Observable<FieldReadinessGatePublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<FieldReadinessGatePublic>(
      `${environment.apiUrl}field/instrument-revisions/${revisionId}/readiness`,
      { params }
    );
  }

  /** Motor Study Intelligence — journey + QA dinámico + Readiness (consultivo). */
  getStudyIntelligence(
    revisionId: number,
    companyId?: number | null
  ): Observable<StudyIntelligenceBundlePublic> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<StudyIntelligenceBundlePublic>(
      `${environment.apiUrl}field/instrument-revisions/${revisionId}/study-intelligence`,
      { params }
    );
  }

  importCsv(projectId: number, file: File): Observable<FieldImportRun> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<FieldImportRun>(
      `${environment.apiUrl}field/projects/${projectId}/import`,
      fd
    );
  }

  listImportRuns(projectId: number, limit = 50): Observable<FieldImportRun[]> {
    return this.http.get<FieldImportRun[]>(
      `${environment.apiUrl}field/projects/${projectId}/import-runs`,
      { params: { limit: String(limit) } }
    );
  }

  listImportRunRows(
    projectId: number,
    runId: number,
    offset = 0,
    limit = 100
  ): Observable<FieldImportRow[]> {
    return this.http.get<FieldImportRow[]>(
      `${environment.apiUrl}field/projects/${projectId}/import-runs/${runId}/rows`,
      { params: { offset: String(offset), limit: String(limit) } }
    );
  }

  listImportRunFindings(projectId: number, runId: number): Observable<FieldFinding[]> {
    return this.http.get<FieldFinding[]>(
      `${environment.apiUrl}field/projects/${projectId}/import-runs/${runId}/findings`
    );
  }

  listLedgerEvents(projectId: number, limit = 100): Observable<FieldLedgerEvent[]> {
    return this.http.get<FieldLedgerEvent[]>(
      `${environment.apiUrl}field/projects/${projectId}/ledger-events`,
      { params: { limit: String(limit) } }
    );
  }

  listEndClients(companyId?: number | null): Observable<EndClient[]> {
    let params = new HttpParams();
    if (companyId != null && Number.isFinite(companyId)) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<EndClient[]>(environment.apiUrl + 'end-clients', { params });
  }

  createEndClient(body: EndClientCreateBody): Observable<EndClient> {
    return this.http.post<EndClient>(environment.apiUrl + 'end-clients', body);
  }

  getDoobloContext(companyId: number): Observable<DoobloCompanyConfig> {
    return this.http.get<DoobloCompanyConfig>(`${environment.apiUrl}field/dooblo/credentials`, {
      params: { company_id: String(companyId) },
    });
  }

  putDoobloCredentials(companyId: number, body: DoobloCredentialsPut): Observable<unknown> {
    return this.http.put(
      `${environment.apiUrl}field/dooblo/credentials`,
      body,
      { params: { company_id: String(companyId) } }
    );
  }

  getQualtricsCredentials(companyId: number): Observable<QualtricsCompanyConfig> {
    return this.http.get<QualtricsCompanyConfig>(`${environment.apiUrl}field/qualtrics/credentials`, {
      params: { company_id: String(companyId) },
    });
  }

  getQualtricsStatus(companyId: number, probe = false): Observable<QualtricsCompanyConfig> {
    let params = new HttpParams().set('company_id', String(companyId));
    if (probe) {
      params = params.set('probe', 'true');
    }
    return this.http.get<QualtricsCompanyConfig>(`${environment.apiUrl}field/qualtrics/status`, {
      params,
    });
  }

  putQualtricsCredentials(companyId: number, body: QualtricsCredentialsPut): Observable<unknown> {
    return this.http.put(`${environment.apiUrl}field/qualtrics/credentials`, body, {
      params: { company_id: String(companyId) },
    });
  }

  /** Customers × CustomerProjects: proyectos Studio visibles para el usuario API (toda la organización permitida). */
  listDoobloOrganizationStudioProjectsCatalog(
    companyId: number,
    opts?: { page?: number; page_size?: number; q?: string; max_customers?: number }
  ): Observable<OrganizationStudioProjectsCatalogPage> {
    let params = new HttpParams()
      .set('company_id', String(companyId))
      .set('page', String(opts?.page ?? 1))
      .set('page_size', String(opts?.page_size ?? 25))
      .set('max_customers', String(opts?.max_customers ?? 10));
    const q = opts?.q?.trim();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<OrganizationStudioProjectsCatalogPage>(
      `${environment.apiUrl}field/dooblo/catalog/organization-studio-projects`,
      { params }
    );
  }

  listDoobloCustomersCatalog(
    companyId: number,
    opts?: { page?: number; page_size?: number; q?: string }
  ): Observable<RemoteFieldCatalogPage> {
    let params = new HttpParams()
      .set('company_id', String(companyId))
      .set('page', String(opts?.page ?? 1))
      .set('page_size', String(opts?.page_size ?? 25));
    const q = opts?.q?.trim();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<RemoteFieldCatalogPage>(
      `${environment.apiUrl}field/dooblo/catalog/customers`,
      { params }
    );
  }

  listDoobloCustomerProjectsCatalog(
    companyId: number,
    customerId: string,
    opts?: { page?: number; page_size?: number; q?: string }
  ): Observable<RemoteFieldCatalogPage> {
    let params = new HttpParams()
      .set('company_id', String(companyId))
      .set('customer_id', customerId.trim())
      .set('page', String(opts?.page ?? 1))
      .set('page_size', String(opts?.page_size ?? 25));
    const q = opts?.q?.trim();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<RemoteFieldCatalogPage>(
      `${environment.apiUrl}field/dooblo/catalog/customer-projects`,
      { params }
    );
  }

  listDoobloProjectSurveysCatalog(
    companyId: number,
    projectId: string,
    opts?: { page?: number; page_size?: number; q?: string }
  ): Observable<RemoteFieldCatalogPage> {
    let params = new HttpParams()
      .set('company_id', String(companyId))
      .set('project_id', projectId.trim())
      .set('page', String(opts?.page ?? 1))
      .set('page_size', String(opts?.page_size ?? 25));
    const q = opts?.q?.trim();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<RemoteFieldCatalogPage>(
      `${environment.apiUrl}field/dooblo/catalog/project-surveys`,
      { params }
    );
  }

  listExternalSources(projectId: number): Observable<FieldProjectExternalSource[]> {
    return this.http.get<FieldProjectExternalSource[]>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/external-sources`
    );
  }

  createExternalSource(
    projectId: number,
    body: FieldProjectExternalSourceCreate
  ): Observable<FieldProjectExternalSource> {
    return this.http.post<FieldProjectExternalSource>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/external-sources`,
      body
    );
  }

  listSyncRuns(projectId: number, limit = 20): Observable<FieldSyncRun[]> {
    return this.http.get<FieldSyncRun[]>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/sync-runs`,
      { params: { limit: String(limit) } }
    );
  }

  postDoobloAnalyze(projectId: number, body: DoobloAnalyzeBody): Observable<FieldSyncRun> {
    return this.http.post<FieldSyncRun>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/dooblo-analyze`,
      body
    );
  }

  listDecisionLayerFindings(
    projectId: number,
    source: string | null = null,
    limit = 50
  ): Observable<FieldFinding[]> {
    let params: HttpParams = new HttpParams().set('limit', String(limit));
    if (source) {
      params = params.set('source', source);
    }
    return this.http.get<FieldFinding[]>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/findings`,
      { params }
    );
  }

  listFindingDecisionLog(
    projectId: number,
    findingId: number,
    limit = 100
  ): Observable<FieldFindingDecisionLog[]> {
    return this.http.get<FieldFindingDecisionLog[]>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/findings/${findingId}/decision-log`,
      { params: { limit: String(limit) } }
    );
  }

  patchFindingApproval(
    projectId: number,
    findingId: number,
    body: FieldFindingApprovalBody
  ): Observable<FieldFinding> {
    return this.http.patch<FieldFinding>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/findings/${findingId}/approval`,
      body
    );
  }

  /**
   * Clever / capa ejecutiva (cuando el backend exponga el endpoint).
   * Contrato esperado (MVP): `{ risks, impact, recommendations }` u objeto arbitrario.
   */
  generateFieldExecutiveSummary(body: {
    field_project_id: number;
  }): Observable<unknown> {
    return this.http.post<unknown>(`${environment.apiUrl}clever/generate-summary`, body);
  }
}
