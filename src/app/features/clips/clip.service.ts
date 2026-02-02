import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Clip {
  id: number;
  evaluation_id: number;
  cloudflare_uid: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  verbatim_type: 'critical' | 'negative' | 'positive';
  verbatim_text: string;
  verbatim_origin: string;
  original_timestamp: number;
  clip_start: number;
  clip_end: number;
  clip_duration: number;
  priority_score: number;
  priority_rank: number | null;
  is_delivered: boolean;
  status: 'pending' | 'processing' | 'uploading' | 'ready' | 'failed' | 'deleted';
  error_message: string | null;
  extra_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ClipsResponse {
  data: Clip[];
  total: number;
  delivered_count: number;
}

export interface ClipsStatus {
  evaluation_id: number;
  total: number;
  ready: number;
  failed: number;
  pending: number;
  processing: number;
  is_complete: boolean;
  success_rate: number;
}

// Extended clip with smart title for UI
export interface SmartClip extends Clip {
  smart_title: string;
  impact_label: string;
  timestamp_display: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Get clips for an evaluation
   * @param evaluationId Evaluation ID
   * @param deliveredOnly Only return Top N delivered clips (default: true)
   */
  getClipsForEvaluation(evaluationId: number, deliveredOnly = true): Observable<ClipsResponse> {
    const params = new HttpParams().set('delivered_only', deliveredOnly.toString());
    return this.http.get<ClipsResponse>(`${this.baseUrl}clips/evaluation/${evaluationId}`, { params });
  }

  /**
   * Get single clip by ID
   */
  getClip(clipId: number): Observable<Clip> {
    return this.http.get<Clip>(`${this.baseUrl}clips/${clipId}`);
  }

  /**
   * Get processing status of clips for an evaluation
   * Useful for polling during generation
   */
  getClipsStatus(evaluationId: number): Observable<ClipsStatus> {
    return this.http.get<ClipsStatus>(`${this.baseUrl}clips/evaluation/${evaluationId}/status`);
  }

  /**
   * Transform clip to SmartClip with generated titles
   */
  toSmartClip(clip: Clip): SmartClip {
    return {
      ...clip,
      smart_title: this.generateSmartTitle(clip),
      impact_label: this.getImpactLabel(clip),
      timestamp_display: this.formatTimestamp(clip.original_timestamp)
    };
  }

  /**
   * Generate executive-friendly title from verbatim
   */
  private generateSmartTitle(clip: Clip): string {
    const origin = clip.verbatim_origin === 'cliente' ? 'Customer' : 'Agent';
    const type = clip.verbatim_type;
    
    // Smart titles based on type
    if (type === 'critical') {
      if (clip.verbatim_text.toLowerCase().includes('inaceptable')) {
        return `${origin} expresses strong dissatisfaction`;
      }
      if (clip.verbatim_text.toLowerCase().includes('ayud')) {
        return `${origin} reports lack of assistance`;
      }
      if (clip.verbatim_text.toLowerCase().includes('esper')) {
        return `${origin} frustrated by wait time`;
      }
      return `Critical moment: ${origin} feedback`;
    }
    
    if (type === 'negative') {
      if (clip.verbatim_text.toLowerCase().includes('tiempo')) {
        return `${origin} mentions time concerns`;
      }
      if (clip.verbatim_text.toLowerCase().includes('problema')) {
        return `${origin} describes problem`;
      }
      return `Negative feedback from ${origin}`;
    }
    
    if (type === 'positive') {
      if (clip.verbatim_text.toLowerCase().includes('gracia')) {
        return `${origin} expresses gratitude`;
      }
      if (clip.verbatim_text.toLowerCase().includes('excelente')) {
        return `${origin} praises service`;
      }
      return `Positive moment from ${origin}`;
    }
    
    return `Clip at ${this.formatTimestamp(clip.original_timestamp)}`;
  }

  /**
   * Get impact label for C-Level
   */
  private getImpactLabel(clip: Clip): string {
    if (clip.priority_score >= 100) return 'Critical Impact';
    if (clip.priority_score >= 70) return 'High Impact';
    if (clip.priority_score >= 40) return 'Medium Impact';
    return 'Low Impact';
  }

  /**
   * Format seconds to mm:ss
   */
  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get Cloudflare Stream embed URL for iframe
   */
  getEmbedUrl(clip: Clip): string {
    if (!clip.cloudflare_uid) return '';
    return `https://customer-hmba8ctlrczwxylv.cloudflarestream.com/${clip.cloudflare_uid}/iframe`;
  }

  /**
   * Get verbatim type config
   */
  getVerbatimConfig(type: 'critical' | 'negative' | 'positive'): { icon: string; color: string; bgColor: string } {
    const configs = {
      critical: { icon: '🔴', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30' },
      negative: { icon: '🟠', color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      positive: { icon: '🟢', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30' }
    };
    return configs[type];
  }
}
