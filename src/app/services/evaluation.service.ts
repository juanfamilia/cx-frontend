import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Evaluation, EvaluationList } from '@interfaces/evaluation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<EvaluationList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<EvaluationList>(environment.apiUrl + 'evaluations/', {
      params,
    });
  }

  getOne(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(environment.apiUrl + 'evaluations/' + id);
  }

  create(data: FormData) {
    return this.http.post(environment.apiUrl + 'evaluations/', data);
  }

  update(data: FormData, id: number): Observable<Evaluation> {
    return this.http.put<Evaluation>(
      environment.apiUrl + 'evaluations/' + id,
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'evaluations/' + id);
  }
}
