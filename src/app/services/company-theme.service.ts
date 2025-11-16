import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompanyTheme {
  id: string;
  company_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  font_family?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeCreate {
  company_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  font_family?: string;
  is_active?: boolean;
}

export interface ThemeUpdate {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  font_family?: string;
  is_active?: boolean;
}

export interface ThemePreview {
  css: string;
  preview_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyThemeService {
  private apiUrl = `${environment.apiUrl}/theme`;

  constructor(private http: HttpClient) {}

  getTheme(): Observable<CompanyTheme> {
    return this.http.get<CompanyTheme>(this.apiUrl);
  }

  getPublicTheme(companyId: string): Observable<CompanyTheme> {
    return this.http.get<CompanyTheme>(`${this.apiUrl}/public/${companyId}`);
  }

  getThemeCSS(): Observable<{ css: string }> {
    return this.http.get<{ css: string }>(`${this.apiUrl}/css`);
  }

  createTheme(theme: ThemeCreate): Observable<CompanyTheme> {
    return this.http.post<CompanyTheme>(this.apiUrl, theme);
  }

  updateTheme(theme: ThemeUpdate): Observable<CompanyTheme> {
    return this.http.put<CompanyTheme>(this.apiUrl, theme);
  }

  previewTheme(theme: ThemeUpdate): Observable<ThemePreview> {
    return this.http.post<ThemePreview>(`${this.apiUrl}/preview`, theme);
  }

  applyTheme(theme: CompanyTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary_color);
    root.style.setProperty('--secondary-color', theme.secondary_color);
    root.style.setProperty('--accent-color', theme.accent_color);
    if (theme.font_family) {
      root.style.setProperty('--font-family', theme.font_family);
    }
    if (theme.custom_css) {
      this.injectCustomCSS(theme.custom_css);
    }
  }

  private injectCustomCSS(css: string): void {
    let styleEl = document.getElementById('custom-theme-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }
}
