import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface CompanyTheme {
  id: number;
  company_id: number;
  company_logo_url?: string;
  company_favicon_url?: string;
  company_name_override?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  font_family_primary: string;
  font_family_secondary?: string;
  sidebar_background: string;
  header_background: string;
  custom_css?: string;
  features_config?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyThemeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'theme/';

  getTheme(): Observable<CompanyTheme> {
    return this.http.get<CompanyTheme>(this.baseUrl);
  }

  getPublicTheme(companyId: number): Observable<CompanyTheme> {
    return this.http.get<CompanyTheme>(this.baseUrl + `public/${companyId}`);
  }

  updateTheme(theme: Partial<CompanyTheme>): Observable<CompanyTheme> {
    return this.http.put<CompanyTheme>(this.baseUrl, theme);
  }

  getCustomCSS(): Observable<{ css: string }> {
    return this.http.get<{ css: string }>(this.baseUrl + 'css');
  }

  previewTheme(theme: Partial<CompanyTheme>): Observable<{ css: string }> {
    return this.http.post<{ css: string }>(this.baseUrl + 'preview', theme);
  }

  resetToDefault(): Observable<CompanyTheme> {
    return this.http.post<CompanyTheme>(this.baseUrl + 'reset', {});
  }

  applyTheme(theme: CompanyTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary_color);
    root.style.setProperty('--secondary-color', theme.secondary_color);
    root.style.setProperty('--accent-color', theme.accent_color);
    root.style.setProperty('--success-color', theme.success_color);
    root.style.setProperty('--warning-color', theme.warning_color);
    root.style.setProperty('--error-color', theme.error_color);
    root.style.setProperty('--font-primary', theme.font_family_primary);
    if (theme.font_family_secondary) {
      root.style.setProperty('--font-secondary', theme.font_family_secondary);
    }
    root.style.setProperty('--sidebar-bg', theme.sidebar_background);
    root.style.setProperty('--header-bg', theme.header_background);

    if (theme.custom_css) {
      let styleEl = document.getElementById('custom-theme-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-theme-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = theme.custom_css;
    }

    if (theme.company_favicon_url) {
      let link: HTMLLinkElement | null =
        document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = theme.company_favicon_url;
    }
  }
}
