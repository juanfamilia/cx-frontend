import { Injectable } from '@angular/core';
import {
  DashboardAdmin,
  DashboardEvaluator,
  DashboardManager,
  DashboardSuperAdmin,
} from '@interfaces/dashboard';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base/base-http.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseHttpService {
  private readonly endpoint = 'dashboard';

  getDashboardSuperAdmin(): Observable<DashboardSuperAdmin> {
    return this.get<DashboardSuperAdmin>(this.endpoint);
  }

  getDashboardAdmin(): Observable<DashboardAdmin> {
    return this.get<DashboardAdmin>(this.endpoint);
  }

  getDashboardManager(): Observable<DashboardManager> {
    return this.get<DashboardManager>(this.endpoint);
  }

  getDashboardEvaluator(): Observable<DashboardEvaluator> {
    return this.get<DashboardEvaluator>(this.endpoint);
  }
}
