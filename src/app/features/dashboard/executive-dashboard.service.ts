import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExecutiveMetrics {
  total_interactions: number;
  avg_nps: number | null;
  avg_ces: number | null;
  avg_service_quality: number | null;
  greeting_rate: number | null;
  product_offer_rate: number | null;
  resolution_rate: number | null;
  churn_risk_rate: number | null;
  positive_interactions: number;
  negative_interactions: number;
  neutral_interactions: number;
}

export interface BranchMetrics {
  branch_id: string;
  branch_name: string | null;
  interaction_count: number;
  avg_nps: number | null;
  avg_ces: number | null;
  avg_service_quality: number | null;
}

/** Matches OpenAPI `ExecutiveDashboardResponse` (date_range is loosely typed server-side). */
export interface ExecutiveDashboardResponse {
  metrics: ExecutiveMetrics;
  branches: BranchMetrics[];
  date_range: {
    start?: string | null;
    end?: string | null;
    [key: string]: unknown;
  };
}

/** Query params for GET `/executive/metrics` (OpenAPI: Executive Dashboard). */
export interface DashboardFilters {
  /** Scope metrics; OpenAPI notes: may be required for role 0 if the user has no company_id. */
  company_id?: number | null;
  branch_id?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  interaction_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExecutiveDashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get executive dashboard metrics with optional filters
   */
  getMetrics(filters?: DashboardFilters): Observable<ExecutiveDashboardResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.company_id != null) {
        params = params.set('company_id', String(filters.company_id));
      }
      if (filters.branch_id) params = params.set('branch_id', filters.branch_id);
      if (filters.country) params = params.set('country', filters.country);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.interaction_type) {
        params = params.set('interaction_type', filters.interaction_type);
      }
    }
    
    return this.http.get<ExecutiveDashboardResponse>(
      `${this.apiUrl}executive/metrics`,
      { params }
    );
  }

  /**
   * Format NPS score with classification
   */
  getNpsClassification(score: number | null): { label: string; color: string } {
    if (score === null) return { label: 'N/A', color: 'gray' };
    
    if (score >= 9) return { label: 'Promotor', color: 'green' };
    if (score >= 7) return { label: 'Pasivo', color: 'yellow' };
    return { label: 'Detractor', color: 'red' };
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number | null): string {
    if (value === null) return '-';
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get risk level from score
   */
  getRiskLevel(score: number | null): { label: string; color: string } {
    if (score === null) return { label: 'N/A', color: 'gray' };
    
    if (score >= 70) return { label: 'Alto', color: 'red' };
    if (score >= 40) return { label: 'Medio', color: 'yellow' };
    return { label: 'Bajo', color: 'green' };
  }
}
