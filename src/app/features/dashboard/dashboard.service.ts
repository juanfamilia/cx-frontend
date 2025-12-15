import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  DashboardAdmin,
  DashboardEvaluator,
  DashboardManager,
  DashboardSuperAdmin,
} from '@interfaces/dashboard';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getDashboardSuperAdmin(): Observable<DashboardSuperAdmin> {
    return this.http.get<DashboardSuperAdmin>(
      environment.apiUrl + 'dashboard/'
    );
  }

  getDashboardAdmin(): Observable<DashboardAdmin> {
    return this.http.get<DashboardAdmin>(environment.apiUrl + 'dashboard/');
  }

  getDashboardManager(): Observable<DashboardManager> {
    return this.http.get<DashboardManager>(environment.apiUrl + 'dashboard/');
  }

  getDashboardEvaluator(): Observable<DashboardEvaluator> {
    return this.http.get<DashboardEvaluator>(environment.apiUrl + 'dashboard/');
  }
}
