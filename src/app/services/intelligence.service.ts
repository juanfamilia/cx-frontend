import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base/base-http.service';

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
export class IntelligenceService extends BaseHttpService {
  private readonly endpoint = 'intelligence';

  getInsights(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    priority?: string;
    is_read?: boolean;
  }): Observable<Insight[]> {
    return this.get<Insight[]>(`${this.endpoint}/insights`, params);
  }

  getInsightsSummary(): Observable<InsightSummary> {
    return this.get<InsightSummary>(`${this.endpoint}/insights/summary`);
  }

  getTrends(params?: {
    skip?: number;
    limit?: number;
    metric?: string;
  }): Observable<Trend[]> {
    return this.get<Trend[]>(`${this.endpoint}/insights/trends`, params);
  }

  getTopActions(limit: number = 5): Observable<any[]> {
    return this.get<any[]>(`${this.endpoint}/insights/top-actions`, { limit });
  }

  markInsightAsRead(insightId: string): Observable<Insight> {
    return this.put<Insight>(`${this.endpoint}/insights/${insightId}/read`, {});
  }
}
