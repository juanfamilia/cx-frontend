import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  CampaignGoalsEvaluator,
  CampaignGoalsEvaluatorCreate,
  CampaignGoalsEvaluatorList,
  CampaignGoalsEvaluatorUpdate,
} from '@interfaces/campaign-goals-evaluator';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignGoalsEvaluatorService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<CampaignGoalsEvaluatorList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CampaignGoalsEvaluatorList>(
      environment.apiUrl + '/campaign-goals-evaluator/',
      {
        params,
      }
    );
  }

  getOne(id: number): Observable<CampaignGoalsEvaluator> {
    return this.http.get<CampaignGoalsEvaluator>(
      environment.apiUrl + '/campaign-goals-evaluator/' + id
    );
  }

  create(
    data: CampaignGoalsEvaluatorCreate
  ): Observable<CampaignGoalsEvaluator> {
    return this.http.post<CampaignGoalsEvaluator>(
      environment.apiUrl + '/campaign-goals-evaluator/',
      data
    );
  }

  update(
    data: CampaignGoalsEvaluatorUpdate,
    id: number
  ): Observable<CampaignGoalsEvaluator> {
    return this.http.put<CampaignGoalsEvaluator>(
      environment.apiUrl + '/campaign-goals-evaluator/' + id,
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + '/campaign-goals-evaluator/' + id
    );
  }
}
