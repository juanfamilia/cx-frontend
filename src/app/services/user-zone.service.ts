import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserZone, UserZoneCreate, UserZoneList } from '@interfaces/user-zone';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserZoneService {
  private http = inject(HttpClient);

  getAll(
    user_id: number,
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<UserZoneList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserZoneList>('user-zone/all/' + user_id, {
      params,
    });
  }

  create(user_id: number, data: UserZoneCreate): Observable<UserZone> {
    return this.http.post<UserZone>('user-zone/' + user_id, data);
  }

  getOne(id: number): Observable<UserZone> {
    return this.http.get<UserZone>('user-zone/' + id);
  }

  update(newZoneID: number, id: number): Observable<UserZone> {
    return this.http.put<UserZone>('user-zone/' + id, newZoneID);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>('user-zone/' + id);
  }
}
