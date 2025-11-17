import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base/base-http.service';

export interface CompanyTheme {
  id: string;
  company_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  created_at: string;
  updated_at: string;
}

export interface ThemeCreate {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
}

export interface ThemeUpdate {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyThemeService extends BaseHttpService {
  private readonly endpoint = 'theme';

  getTheme(): Observable<CompanyTheme> {
    return this.get<CompanyTheme>(this.endpoint, undefined, true);
  }

  getThemeCSS(): Observable<string> {
    return this.get<string>(`${this.endpoint}/css`);
  }

  createTheme(theme: ThemeCreate): Observable<CompanyTheme> {
    return this.post<CompanyTheme>(this.endpoint, theme, true);
  }

  updateTheme(theme: ThemeUpdate): Observable<CompanyTheme> {
    return this.put<CompanyTheme>(this.endpoint, theme, true);
  }

  previewTheme(theme: ThemeCreate): Observable<{ css: string }> {
    return this.post<{ css: string }>(`${this.endpoint}/preview`, theme);
  }

  getPublicTheme(companyId: string): Observable<CompanyTheme> {
    return this.get<CompanyTheme>(`${this.endpoint}/public/${companyId}`);
  }
}
