import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/** Origen principal declarado al crear el proyecto (tablero Field). */
export type FieldIngestMode = 'csv' | 'dooblo';

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
  /** csv: archivo; dooblo: API SurveyToGo. (Ausente = CSV en despliegues anteriores.) */
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
  created_at: string;
  updated_at: string;
}

export interface FieldStudyCreateBody {
  name: string;
  description?: string | null;
  client_id: number;
  company_id?: number | null;
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
