import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Widget {
  id: number;
  widget_type: string;
  widget_name: string;
  description: string;
  data_source: string;
  default_config?: any;
  available_for_roles: number[];
  category: string;
}

export interface WidgetsResponse {
  data: Widget[];
  total: number;
}

export interface DashboardConfig {
  id: number;
  user_id: number;
  layout_config: any;
  is_default: boolean;
  config_name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardConfigsResponse {
  data: DashboardConfig[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardConfigService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'dashboard-config/';

  // Widgets
  getWidgets(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Observable<WidgetsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<WidgetsResponse>(this.baseUrl + 'widgets', {
      params: httpParams,
    });
  }

  getWidget(widgetId: number): Observable<Widget> {
    return this.http.get<Widget>(this.baseUrl + `widgets/${widgetId}`);
  }

  // Dashboard Configs
  getDashboardConfigs(params?: {
    skip?: number;
    limit?: number;
  }): Observable<DashboardConfigsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<DashboardConfigsResponse>(this.baseUrl, {
      params: httpParams,
    });
  }

  getDashboardConfig(configId: number): Observable<DashboardConfig> {
    return this.http.get<DashboardConfig>(this.baseUrl + `${configId}`);
  }

  createDashboardConfig(config: {
    layout_config: any;
    config_name: string;
    is_default?: boolean;
  }): Observable<DashboardConfig> {
    return this.http.post<DashboardConfig>(this.baseUrl, config);
  }

  updateDashboardConfig(
    configId: number,
    config: Partial<DashboardConfig>
  ): Observable<DashboardConfig> {
    return this.http.put<DashboardConfig>(this.baseUrl + `${configId}`, config);
  }

  deleteDashboardConfig(configId: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `${configId}`);
  }

  getDefaultConfig(): Observable<any> {
    return this.http.get(this.baseUrl + 'default');
  }

  setAsDefault(configId: number): Observable<DashboardConfig> {
    return this.http.post<DashboardConfig>(
      this.baseUrl + `${configId}/set-default`,
      {}
    );
  }
}
