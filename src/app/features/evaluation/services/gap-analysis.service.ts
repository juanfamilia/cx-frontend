import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface GapDiscrepancy {
  aspect_name: string;
  section_name?: string;
  human_value: number | string | null;
  ai_value: number | string | null;
  gap_magnitude: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  direction: 'AI_HIGHER' | 'AI_LOWER' | 'DISAGREEMENT';
  note?: string;
}

export interface GapAnalysisResult {
  evaluation_id: number;
  reliability_score: number;
  total_aspects_compared: number;
  discrepancies: GapDiscrepancy[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  computed_at: string;
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
