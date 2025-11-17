import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base/base-http.service';

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: string[];
  category: string;
  is_active: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptCreate {
  name: string;
  description?: string;
  template: string;
  category: string;
  is_active?: boolean;
  company_id?: string;
  variables?: string[];
}

export interface PromptUpdate {
  name?: string;
  description?: string;
  template?: string;
  category?: string;
  is_active?: boolean;
  variables?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PromptManagerService extends BaseHttpService {
  private readonly endpoint = 'prompts';

  getPrompts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_active?: boolean;
  }): Observable<Prompt[]> {
    return this.get<Prompt[]>(this.endpoint, params, true);
  }

  getPromptById(id: string): Observable<Prompt> {
    return this.get<Prompt>(`${this.endpoint}/${id}`);
  }

  createPrompt(prompt: PromptCreate): Observable<Prompt> {
    return this.post<Prompt>(this.endpoint, prompt, true);
  }

  updatePrompt(id: string, prompt: PromptUpdate): Observable<Prompt> {
    return this.put<Prompt>(`${this.endpoint}/${id}`, prompt);
  }

  deletePrompt(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
