import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CompanyList } from '@interfaces/company';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<CompanyList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CompanyList>(environment.apiUrl + 'company/', {
      params,
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'company/' + id);
  }
}
