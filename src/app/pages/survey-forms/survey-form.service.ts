import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  SurveyFormCreate,
  SurveyFormDetail,
  SurveyFormList,
} from '@interfaces/survey-form';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyFormService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<SurveyFormList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<SurveyFormList>(environment.apiUrl + 'survey/', {
      params,
    });
  }

  create(data: SurveyFormCreate): Observable<SurveyFormDetail> {
    return this.http.post<SurveyFormDetail>(
      environment.apiUrl + 'survey/',
      data
    );
  }

  update(data: SurveyFormCreate, id: number): Observable<SurveyFormDetail> {
    return this.http.put<SurveyFormDetail>(
      environment.apiUrl + 'survey/' + id,
      data
    );
  }

  getOne(id: number): Observable<SurveyFormDetail> {
    return this.http.get<SurveyFormDetail>(environment.apiUrl + 'survey/' + id);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'survey/' + id);
  }
}
