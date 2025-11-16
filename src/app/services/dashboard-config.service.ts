import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  default_config: any;
  available_for_roles: string[];
}

export interface DashboardWidget {
  widget_id: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  role: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardConfigCreate {
  name: string;
  description?: string;
  role: string;
  widgets: DashboardWidget[];
  is_default?: boolean;
  company_id?: string;
}

export interface DashboardConfigUpdate {
  name?: string;
  description?: string;
  widgets?: DashboardWidget[];
  is_default?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardConfigService {
  private apiUrl = `${environment.apiUrl}/dashboard-config`;

  constructor(private http: HttpClient) {}

  getAvailableWidgets(): Observable<WidgetDefinition[]> {
    return this.http.get<WidgetDefinition[]>(`${this.apiUrl}/widgets/available`);
  }

  getDashboardConfigs(params?: {
    skip?: number;
    limit?: number;
    role?: string;
  }): Observable<DashboardConfig[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<DashboardConfig[]>(this.apiUrl, { params: httpParams });
  }

  getDefaultConfig(role: string): Observable<DashboardConfig> {
    return this.http.get<DashboardConfig>(`${this.apiUrl}/default`, {
      params: { role }
    });
  }

  getConfigById(id: string): Observable<DashboardConfig> {
    return this.http.get<DashboardConfig>(`${this.apiUrl}/${id}`);
  }

  createConfig(config: DashboardConfigCreate): Observable<DashboardConfig> {
    return this.http.post<DashboardConfig>(this.apiUrl, config);
  }

  updateConfig(id: string, config: DashboardConfigUpdate): Observable<DashboardConfig> {
    return this.http.put<DashboardConfig>(`${this.apiUrl}/${id}`, config);
  }

  deleteConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
