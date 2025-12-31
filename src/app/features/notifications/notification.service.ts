import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Notification } from '@interfaces/notification';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(environment.apiUrl + 'notifications/');
  }

  getCount(): Observable<number> {
    return this.http.get<number>(environment.apiUrl + 'notifications/count');
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.get<Notification>(
      environment.apiUrl + 'notifications/mark-as-read/' + id,
      {}
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'notifications/' + id);
  }
}
