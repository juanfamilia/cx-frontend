import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

export interface FieldProject {
  id: number;
  company_id: number;
  client_id: number;
  name: string;
  description: string | null;
  import_format_version: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FieldProjectCreateBody {
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

export interface FieldFinding {
  id: number;
  field_project_id: number;
  field_import_run_id: number;
  field_import_row_id: number | null;
  code: string;
  severity: string;
  case_id: string | null;
  wave_id: string | null;
  message: string;
  created_at: string;
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

/** Hallazgo de la capa de decisión (CSV, dooblo_analysis, …). */
export interface FieldDecisionFinding {
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
  created_at: string;
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

  createProject(body: FieldProjectCreateBody): Observable<FieldProject> {
    return this.http.post<FieldProject>(environment.apiUrl + 'field/projects', body);
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
  ): Observable<FieldDecisionFinding[]> {
    let params: HttpParams = new HttpParams().set('limit', String(limit));
    if (source) {
      params = params.set('source', source);
    }
    return this.http.get<FieldDecisionFinding[]>(
      `${environment.apiUrl}field/projects/${projectId}/decision-layer/findings`,
      { params }
    );
  }
}
