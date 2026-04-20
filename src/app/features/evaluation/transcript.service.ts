import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** OpenAPI: `TranscriptSegmentPublic`. */
export interface TranscriptSegment {
  id: number;
  evaluation_id: number;
  start_time: number;
  end_time: number;
  text: string;
  speaker?: string | null;
  confidence?: number | null;
  created_at: string;
}

export interface TranscriptSegmentsResponse {
  data: TranscriptSegment[];
  total: number;
  duration: number;
}

/** OpenAPI: `TranscriptSearchResult` (nullable fields as returned by JSON). */
export interface TranscriptSearchResult {
  segment_id: number;
  evaluation_id: number;
  start_time: number;
  end_time: number;
  text: string;
  branch_name?: string | null;
  interaction_date?: string | null;
  similarity_score?: number | null;
}

export interface TranscriptSearchResponse {
  results: TranscriptSearchResult[];
  total: number;
  query: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all transcript segments for an evaluation
   * Returns segments ordered by start time for synchronized playback
   */
  getEvaluationTranscript(evaluationId: number): Observable<TranscriptSegmentsResponse> {
    return this.http.get<TranscriptSegmentsResponse>(
      `${this.apiUrl}transcript-segments/evaluation/${evaluationId}`
    );
  }

  /** Segments list for playback (maps API envelope to a plain array). */
  getEvaluationSegments(evaluationId: number): Observable<TranscriptSegment[]> {
    return this.getEvaluationTranscript(evaluationId).pipe(
      map(res => res.data ?? [])
    );
  }

  /**
   * Keyword search across transcript segments
   */
  searchTranscripts(
    query: string,
    branchId?: string,
    limit: number = 50,
    /** Required for admin users without `company_id` on the token (API scopes search). */
    companyId?: number | null
  ): Observable<TranscriptSearchResponse> {
    let params = new HttpParams().set('q', query).set('limit', String(limit));
    if (branchId) {
      params = params.set('branch_id', branchId);
    }
    if (companyId != null && companyId > 0) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.get<TranscriptSearchResponse>(
      `${this.apiUrl}transcript-segments/search`,
      { params }
    );
  }

  /**
   * Semantic search (OpenAPI: POST `/transcript-segments/semantic-search`, query params `q`, `limit`).
   */
  semanticSearch(
    query: string,
    limit: number = 20,
    companyId?: number | null
  ): Observable<TranscriptSearchResponse> {
    let params = new HttpParams().set('q', query).set('limit', String(limit));
    if (companyId != null && companyId > 0) {
      params = params.set('company_id', String(companyId));
    }
    return this.http.post<TranscriptSearchResponse>(
      `${this.apiUrl}transcript-segments/semantic-search`,
      null,
      { params }
    );
  }

  /**
   * Generate embeddings (OpenAPI: POST `.../generate-embeddings`; 200 schema is unspecified).
   */
  generateEmbeddings(evaluationId: number): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.apiUrl}transcript-segments/evaluation/${evaluationId}/generate-embeddings`,
      {}
    );
  }

  /** Solo Whisper + diarización; reemplaza segmentos y transcript_text (sin GPT). */
  reprocessTranscription(
    evaluationId: number
  ): Observable<{ message: string; evaluation_id: number }> {
    return this.http.post<{ message: string; evaluation_id: number }>(
      `${this.apiUrl}transcript-segments/evaluation/${evaluationId}/reprocess-transcription`,
      {}
    );
  }

  /**
   * Format seconds to mm:ss display
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
