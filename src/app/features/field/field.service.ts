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
}
