import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'alert' | 'recommendation' | 'anomaly';
  priority: 'high' | 'medium' | 'low';
  confidence_score: number;
  data_points: any;
  generated_at: string;
  is_read: boolean;
  company_id?: string;
}

export interface InsightSummary {
  total_insights: number;
  unread_count: number;
  high_priority_count: number;
  by_category: Record<string, number>;
  last_generated: string;
}

export interface Trend {
  id: string;
  metric_name: string;
  direction: 'up' | 'down' | 'stable';
  percentage_change: number;
  period: string;
  data_points: any[];
  generated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntelligenceService {
  private apiUrl = `${environment.apiUrl}/intelligence`;

  constructor(private http: HttpClient) {}

  getInsights(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    priority?: string;
    is_read?: boolean;
  }): Observable<Insight[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Insight[]>(`${this.apiUrl}/insights`, { params: httpParams });
  }

  getInsightsSummary(): Observable<InsightSummary> {
    return this.http.get<InsightSummary>(`${this.apiUrl}/insights/summary`);
  }

  getTrends(params?: {
    skip?: number;
    limit?: number;
    metric?: string;
  }): Observable<Trend[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Trend[]>(`${this.apiUrl}/insights/trends`, { params: httpParams });
  }

  getTopActions(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/insights/top-actions`, {
      params: { limit: limit.toString() }
    });
  }

  markInsightAsRead(insightId: string): Observable<Insight> {
    return this.http.put<Insight>(`${this.apiUrl}/insights/${insightId}/read`, {});
  }
}
