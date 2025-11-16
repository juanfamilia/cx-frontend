import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  template: string;
  category: string;
  variables: string[];
  is_active: boolean;
  version: number;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptCreate {
  name: string;
  description?: string;
  template: string;
  category: string;
  variables: string[];
  is_active?: boolean;
  company_id?: string;
}

export interface PromptUpdate {
  name?: string;
  description?: string;
  template?: string;
  category?: string;
  variables?: string[];
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromptManagerService {
  private apiUrl = `${environment.apiUrl}/prompts`;

  constructor(private http: HttpClient) {}

  getPrompts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_active?: boolean;
  }): Observable<Prompt[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Prompt[]>(this.apiUrl, { params: httpParams });
  }

  getPromptById(id: string): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.apiUrl}/${id}`);
  }

  createPrompt(prompt: PromptCreate): Observable<Prompt> {
    return this.http.post<Prompt>(this.apiUrl, prompt);
  }

  updatePrompt(id: string, prompt: PromptUpdate): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.apiUrl}/${id}`, prompt);
  }

  deletePrompt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  duplicatePrompt(id: string): Observable<Prompt> {
    return this.getPromptById(id).pipe(
      // We'll handle duplication in the component
    );
  }
}
