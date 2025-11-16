import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyThemeService, CompanyTheme, ThemeUpdate } from '../../services/company-theme.service';
import { ShareToasterService } from '../../services/toast.service';

@Component({
  selector: 'app-theme-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-manager.component.html',
  styleUrls: ['./theme-manager.component.scss']
})
export class ThemeManagerComponent implements OnInit {
  theme: CompanyTheme | null = null;
  loading = true;
  isEditing = false;

  form: ThemeUpdate = {
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    logo_url: '',
    favicon_url: '',
    custom_css: '',
    font_family: 'Inter, sans-serif',
    is_active: true
  };

  fontOptions = [
    'Inter, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif'
  ];

  constructor(
    private themeService: CompanyThemeService,
    private toastService: ShareToasterService
  ) {}

  ngOnInit(): void {
    this.loadTheme();
  }

  loadTheme(): void {
    this.loading = true;
    this.themeService.getTheme().subscribe({
      next: (theme) => {
        this.theme = theme;
        this.form = {
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          accent_color: theme.accent_color,
          logo_url: theme.logo_url,
          favicon_url: theme.favicon_url,
          custom_css: theme.custom_css,
          font_family: theme.font_family,
          is_active: theme.is_active
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading theme:', err);
        this.toastService.showError('Error al cargar tema');
        this.loading = false;
      }
    });
  }

  startEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.theme) {
      this.form = {
        primary_color: this.theme.primary_color,
        secondary_color: this.theme.secondary_color,
        accent_color: this.theme.accent_color,
        logo_url: this.theme.logo_url,
        favicon_url: this.theme.favicon_url,
        custom_css: this.theme.custom_css,
        font_family: this.theme.font_family,
        is_active: this.theme.is_active
      };
    }
  }

  saveTheme(): void {
    this.themeService.updateTheme(this.form).subscribe({
      next: (updated) => {
        this.theme = updated;
        this.isEditing = false;
        this.toastService.showSuccess('Tema actualizado exitosamente');
        this.themeService.applyTheme(updated);
      },
      error: (err) => {
        console.error('Error updating theme:', err);
        this.toastService.showError('Error al actualizar tema');
      }
    });
  }

  previewTheme(): void {
    this.themeService.previewTheme(this.form).subscribe({
      next: (preview) => {
        this.toastService.showSuccess('Vista previa generada');
        // Apply temporary preview
        const tempTheme: CompanyTheme = {
          id: 'preview',
          company_id: 'preview',
          ...this.form,
          primary_color: this.form.primary_color!,
          secondary_color: this.form.secondary_color!,
          accent_color: this.form.accent_color!,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.themeService.applyTheme(tempTheme);
      },
      error: (err) => {
        console.error('Error generating preview:', err);
        this.toastService.showError('Error al generar vista previa');
      }
    });
  }

  resetToDefault(): void {
    this.form = {
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      accent_color: '#F59E0B',
      logo_url: '',
      favicon_url: '',
      custom_css: '',
      font_family: 'Inter, sans-serif',
      is_active: true
    };
  }
}
