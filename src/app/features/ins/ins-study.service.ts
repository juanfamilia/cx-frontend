import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

export interface InsStudy {
  id: number;
  company_id: number;
  created_by: number | null;
  title: string;
  objective: string | null;
  status: string;
  pipeline_status: string;
  rubric_version: string;
  created_at: string;
  updated_at: string;
}

export interface InsStudyCreate {
  title: string;
  objective?: string | null;
  company_id?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class InsStudyService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl + 'ins/';

  listStudies(companyId: number): Observable<InsStudy[]> {
    const params = new HttpParams().set('company_id', String(companyId));
    return this.http.get<InsStudy[]>(this.base + 'studies', { params });
  }

  createStudy(body: InsStudyCreate): Observable<InsStudy> {
    return this.http.post<InsStudy>(this.base + 'studies', body);
  }

  runPipeline(studyId: number): Observable<InsStudy> {
    return this.http.post<InsStudy>(this.base + `studies/${studyId}/run`, {});
  }
}
