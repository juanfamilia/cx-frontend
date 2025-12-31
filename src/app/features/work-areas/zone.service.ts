import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Zone } from '@interfaces/zone';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  private http = inject(HttpClient);

  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(environment.apiUrl + 'zones/');
  }

  getOne(id: number): Observable<Zone> {
    return this.http.get<Zone>(environment.apiUrl + 'zones/' + id);
  }
  create(zone: Pick<Zone, 'name' | 'value' | 'country'>): Observable<Zone> {
    return this.http.post<Zone>(environment.apiUrl + 'zones/', zone);
  }  
}
