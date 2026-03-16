import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TranscriptSegment {
  id: number;
  evaluation_id: number;
  start_time: number;
  end_time: number;
  text: string;
  speaker?: string;
  confidence?: number;
  created_at: string;
}

export interface TranscriptSegmentsResponse {
  data: TranscriptSegment[];
  total: number;
  duration: number;
}

export interface TranscriptSearchResult {
  segment_id: number;
  evaluation_id: number;
  start_time: number;
  end_time: number;
  text: string;
  branch_name?: string;
  interaction_date?: string;
  similarity_score?: number;
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

  /**
   * Keyword search across transcript segments
   */
  searchTranscripts(
    query: string,
    branchId?: string,
    limit: number = 50
  ): Observable<TranscriptSearchResponse> {
    const params: any = { q: query, limit };
    if (branchId) params.branch_id = branchId;
    
    return this.http.get<TranscriptSearchResponse>(
      `${this.apiUrl}transcript-segments/search`,
      { params }
    );
  }

  /**
   * Semantic search using AI embeddings
   */
  semanticSearch(
    query: string,
    limit: number = 20
  ): Observable<TranscriptSearchResponse> {
    return this.http.post<TranscriptSearchResponse>(
      `${this.apiUrl}transcript-segments/semantic-search`,
      null,
      { params: { q: query, limit } }
    );
  }

  /**
   * Generate embeddings for an evaluation (enables semantic search)
   */
  generateEmbeddings(evaluationId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}transcript-segments/evaluation/${evaluationId}/generate-embeddings`,
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
