import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Evaluation, EvaluationList } from '@interfaces/evaluation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private http = inject(HttpClient);

  private readonly urlEncodedOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  /** OpenAPI: POST `/evaluations/` expects `application/x-www-form-urlencoded`. */
  private formDataToUrlEncodedBody(fd: FormData): string {
    const usp = new URLSearchParams();
    fd.forEach((value, key) => {
      usp.append(key, typeof value === 'string' ? value : String(value));
    });
    return usp.toString();
  }

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

  updateStatus(
    id: number,
    status: { status: string; comment?: string }
  ): Observable<Evaluation> {
    return this.http.put<Evaluation>(
      environment.apiUrl + 'evaluations/status/' + id,
      status
    );
  }

  getOne(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(environment.apiUrl + 'evaluations/' + id);
  }

  create(data: FormData): Observable<Evaluation> {
    return this.http.post<Evaluation>(
      environment.apiUrl + 'evaluations/',
      this.formDataToUrlEncodedBody(data),
      this.urlEncodedOptions
    );
  }

  update(data: FormData, id: number): Observable<Evaluation> {
    return this.http.put<Evaluation>(
      environment.apiUrl + 'evaluations/' + id,
      this.formDataToUrlEncodedBody(data),
      this.urlEncodedOptions
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'evaluations/' + id);
  }
}
