import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Insight {
  id: number;
  company_id: number;
  evaluation_id?: number;  // Link to evaluation for evidence
  title: string;
  description: string;
  insight_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score: number;
  suggested_actions: string[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsightsPublic {
  data: Insight[];
  total: number;
}

export interface InsightSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total_unread: number;
}

export interface TrendDataset {
  label: string;
  data: number[];
}

export interface InsightTrends {
  labels: string[];
  datasets: TrendDataset[];
}

export interface TopAction {
  action: string;
  frequency: number;
}

@Injectable({
  providedIn: 'root',
})
export class IntelligenceService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'intelligence/';

  getInsights(params?: {
    offset?: number;
    limit?: number;
    severity?: string;
    unread_only?: boolean;
  }): Observable<InsightsPublic> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<InsightsPublic>(`${this.baseUrl}insights`, { params: httpParams });
  }

  getInsightsSummary(): Observable<InsightSummary> {
    return this.http.get<InsightSummary>(`${this.baseUrl}insights/summary`);
  }

  getTrends(days: number = 30): Observable<InsightTrends> {
    return this.http.get<InsightTrends>(`${this.baseUrl}insights/trends`, {
      params: { days: days.toString() },
    });
  }

  getTopActions(limit: number = 10): Observable<{ top_actions: TopAction[] }> {
    return this.http.get<{ top_actions: TopAction[] }>(`${this.baseUrl}insights/top-actions`, {
      params: { limit: limit.toString() },
    });
  }

  markInsightAsRead(insightId: number): Observable<Insight> {
    return this.http.put<Insight>(`${this.baseUrl}insights/${insightId}/read`, {});
  }
}
