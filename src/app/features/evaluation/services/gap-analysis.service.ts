import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

/** Mirrors backend `GapItem` exactly. */
export interface GapItem {
  aspect_id: number;
  aspect_description: string;
  ai_field: string;
  auditor_value: boolean | number | null;
  ai_value: boolean | number | string | null;
  ai_confidence: number;
  discrepancy: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | null;
  note: string;
}

/** Mirrors backend `GapAnalysisResult` exactly. */
export interface GapAnalysisResult {
  evaluation_id: number;
  total_aspects_mapped: number;
  discrepancies_found: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  /** 0–100 scale (not 0–1). */
  reliability_score: number;
  items: GapItem[];
}

@Injectable({ providedIn: 'root' })
export class GapAnalysisService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getForEvaluation(evaluationId: number): Observable<GapAnalysisResult> {
    return this.http.get<GapAnalysisResult>(
      `${this.baseUrl}gap-analysis/evaluation/${evaluationId}`
    );
  }
}
