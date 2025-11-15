import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Insight {
  id: number;
  company_id: number;
  evaluation_id?: number;
  insight_type: string;
  severity: string;
  title: string;
  description: string;
  metrics?: any;
  suggested_actions?: string[];
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsightsResponse {
  data: Insight[];
  total: number;
  skip: number;
  limit: number;
}

export interface Trend {
  id: number;
  company_id: number;
  metric_name: string;
  period: string;
  start_date: string;
  end_date: string;
  current_value: number;
  previous_value?: number;
  change_percentage?: number;
  trend_direction?: string;
  metadata?: any;
  created_at: string;
}

export interface TrendsResponse {
  data: Trend[];
  total: number;
}

export interface AITag {
  id: number;
  tag_name: string;
  category: string;
  usage_count: number;
  is_active: boolean;
}

export interface AITagsResponse {
  data: AITag[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class IntelligenceService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'intelligence/';

  // Insights
  getInsights(params?: {
    skip?: number;
    limit?: number;
    insight_type?: string;
    severity?: string;
    is_read?: boolean;
  }): Observable<InsightsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<InsightsResponse>(this.baseUrl + 'insights', {
      params: httpParams,
    });
  }

  getInsightsSummary(): Observable<any> {
    return this.http.get(this.baseUrl + 'insights/summary');
  }

  getTopActions(): Observable<any> {
    return this.http.get(this.baseUrl + 'insights/top-actions');
  }

  getInsightTrends(): Observable<any> {
    return this.http.get(this.baseUrl + 'insights/trends');
  }

  markInsightAsRead(insightId: number): Observable<Insight> {
    return this.http.put<Insight>(
      this.baseUrl + `insights/${insightId}/read`,
      {}
    );
  }

  // Trends
  getTrends(params?: {
    skip?: number;
    limit?: number;
    metric_name?: string;
    period?: string;
  }): Observable<TrendsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<TrendsResponse>(this.baseUrl + 'trends', {
      params: httpParams,
    });
  }

  // AI Tags
  getAITags(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_active?: boolean;
  }): Observable<AITagsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<AITagsResponse>(this.baseUrl + 'tags', {
      params: httpParams,
    });
  }
}
