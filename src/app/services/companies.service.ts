import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Company } from '@interfaces/company';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private http = inject(HttpClient);

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(environment.apiUrl + 'company/');
  }
}
