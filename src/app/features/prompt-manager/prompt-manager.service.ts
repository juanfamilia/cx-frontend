import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Prompt {
  id: number;
  company_id: number;
  name: string;
  category: string;
  template: string;
  is_active: boolean;
  variables: string[];
  description?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PromptCreate {
  name: string;
  category: string;
  template: string;
  is_active?: boolean;
  description?: string;
  variables?: string[];
}

export interface PromptUpdate extends Partial<PromptCreate> {}

export interface PromptsResponse {
  data: Prompt[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PromptManagerService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'prompts/';

  getPrompts(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
  }): Observable<PromptsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PromptsResponse>(this.baseUrl, { params: httpParams });
  }

  getPrompt(promptId: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.baseUrl}${promptId}`);
  }

  createPrompt(prompt: PromptCreate): Observable<Prompt> {
    return this.http.post<Prompt>(this.baseUrl, prompt);
  }

  updatePrompt(promptId: number, prompt: PromptUpdate): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.baseUrl}${promptId}`, prompt);
  }

  deletePrompt(promptId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${promptId}`);
  }

  getActivePrompt(): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.baseUrl}active`);
  }
}
