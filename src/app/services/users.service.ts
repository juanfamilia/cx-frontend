import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { User } from '@interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(environment.apiUrl + 'user/');
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'user/' + id);
  }
}
