import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { User, UserCreate, UserList } from '@interfaces/user';
import { Observable } from 'rxjs';
import { Options } from '@data/types/options';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<UserList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserList>(environment.apiUrl + 'users/', {
      params,
    });
  }

  getAllOptionsList(): Observable<Options[]> {
    return this.http.get<Options[]>(environment.apiUrl + 'users/plain-list');
  }

  create(data: UserCreate): Observable<User> {
    return this.http.post<User>(environment.apiUrl + 'users/', data);
  }

  getOne(id: number): Observable<User> {
    return this.http.get<User>(environment.apiUrl + 'users/' + id);
  }

  update(data: UserCreate, id: number): Observable<User> {
    return this.http.put<User>(environment.apiUrl + 'users/' + id, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'users/' + id);
  }
}
