import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base/base-http.service';

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
export class DashboardConfigService extends BaseHttpService {
  private readonly endpoint = 'dashboard-config';

  getAvailableWidgets(): Observable<WidgetDefinition[]> {
    return this.get<WidgetDefinition[]>(`${this.endpoint}/widgets/available`);
  }

  getDashboardConfigs(params?: {
    skip?: number;
    limit?: number;
    role?: string;
  }): Observable<DashboardConfig[]> {
    return this.get<DashboardConfig[]>(this.endpoint, params, true);
  }

  getDefaultConfig(role: string): Observable<DashboardConfig> {
    return this.get<DashboardConfig>(`${this.endpoint}/default`, { role });
  }

  getConfigById(id: string): Observable<DashboardConfig> {
    return this.get<DashboardConfig>(`${this.endpoint}/${id}`);
  }

  createConfig(config: DashboardConfigCreate): Observable<DashboardConfig> {
    return this.post<DashboardConfig>(this.endpoint, config, true);
  }

  updateConfig(id: string, config: DashboardConfigUpdate): Observable<DashboardConfig> {
    return this.put<DashboardConfig>(`${this.endpoint}/${id}`, config);
  }

  deleteConfig(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
