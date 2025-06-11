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
    return this.http.get<Zone[]>(environment.apiUrl + 'zone');
  }

  getOne(id: number): Observable<Zone> {
    return this.http.get<Zone>(environment.apiUrl + 'zone/' + id);
  }
}
