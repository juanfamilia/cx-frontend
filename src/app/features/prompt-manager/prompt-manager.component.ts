import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { ShareToasterService } from '@core/services/toast.service';
import {
  PromptManagerService,
  Prompt,
  PromptCreate,
  PromptUpdate,
  PromptsResponse,
} from './prompt-manager.service';

@Component({
  selector: 'app-prompt-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './prompt-manager.component.html',
  styleUrls: ['./prompt-manager.component.css'],
})
export class PromptManagerComponent implements OnInit {
  private promptService = inject(PromptManagerService);
  private toastService = inject(ShareToasterService);
  private cdr = inject(ChangeDetectorRef);

  prompts: Prompt[] = [];
  filteredPrompts: Prompt[] = [];
  selectedPrompt: Prompt | null = null;
  isEditing = false;
  isCreating = false;
  loading = true;

  form: PromptCreate | PromptUpdate = {
    name: '',
    category: 'general',
    template: '',
    description: '',
    variables: [],
    is_active: true,
  };

  filterType: string = '';
  filterActive: string = '';
  searchTerm: string = '';

  categories = ['general', 'greeting', 'followup', 'evaluation', 'notification', 'analysis', 'report'];

  readonly categoryLabels: Record<string, string> = {
    general: 'General',
    greeting: 'Saludo y apertura',
    followup: 'Seguimiento',
    evaluation: 'Evaluación de servicio',
    notification: 'Notificaciones',
    analysis: 'Análisis de conversación',
    report: 'Reportes ejecutivos',
  };

  readonly categoryDescriptions: Record<string, string> = {
    general: 'Instrucciones generales para la IA',
    greeting: 'Cómo detectar y evaluar el saludo inicial del agente',
    followup: 'Qué revisar en el seguimiento post-atención',
    evaluation: 'Criterios de calidad para evaluar la interacción completa',
    notification: 'Cómo redactar alertas y notificaciones automáticas',
    analysis: 'Qué analizar en cada conversación transcrita',
    report: 'Formato y contenido de reportes para gerencia',
  };

  getCategoryLabel(cat: string): string {
    return this.categoryLabels[cat] ?? cat;
  }

  getCategoryDescription(cat: string): string {
    return this.categoryDescriptions[cat] ?? '';
  }

  readonly templatePlaceholder =
    'Ejemplo:\n\nAnaliza la siguiente transcripción y determina si el agente ' +
    '{nombre_agente} cumplió con el protocolo de saludo. Verifica si:\n' +
    '1. Se presentó con su nombre completo\n' +
    '2. Mencionó el nombre de la empresa\n' +
    '3. Ofreció su ayuda de forma cordial\n\n' +
    'Responde indicando: Cumple / No cumple / Cumple parcialmente, con una explicación breve.';

  ngOnInit(): void {
    this.loadPrompts();
  }

  loadPrompts(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.promptService.getPrompts().subscribe({
      next: (response: PromptsResponse) => {
        this.prompts = Array.isArray(response?.data) ? response.data : [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading prompts:', err);
        this.toastService.showToast('error', 'Error', 'Error al cargar prompts');
        this.prompts = [];
        this.filteredPrompts = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    let filtered = Array.isArray(this.prompts) ? [...this.prompts] : [];
    if (this.filterType) {
      filtered = filtered.filter((p: Prompt) => p.category === this.filterType);
    }
    if (this.filterActive === 'true') {
      filtered = filtered.filter((p: Prompt) => p.is_active);
    } else if (this.filterActive === 'false') {
      filtered = filtered.filter((p: Prompt) => !p.is_active);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p: Prompt) =>
          p.name.toLowerCase().includes(term) ||
          (p.description?.toLowerCase().includes(term) ?? false)
      );
    }
    this.filteredPrompts = filtered;
  }

  selectPrompt(prompt: Prompt): void {
    this.selectedPrompt = prompt;
    this.isEditing = false;
    this.isCreating = false;
  }

  startEdit(prompt: Prompt): void {
    this.selectedPrompt = prompt;
    this.isEditing = true;
    this.isCreating = false;
    this.form = {
      name: prompt.name,
      category: prompt.category,
      template: prompt.template,
      description: prompt.description || '',
      variables: [...(prompt.variables ?? [])],
      is_active: prompt.is_active,
    };
  }

  startCreate(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedPrompt = null;
    this.form = {
      name: '',
      category: 'general',
      template: '',
      description: '',
      variables: [],
      is_active: true,
    };
  }

  savePrompt(): void {
    if (this.isCreating) {
      this.createPrompt();
    } else if (this.isEditing && this.selectedPrompt) {
      this.updatePrompt();
    }
  }

  createPrompt(): void {
    this.promptService.createPrompt(this.form as PromptCreate).subscribe({
      next: (prompt: Prompt) => {
        this.prompts.push(prompt);
        this.applyFilters();
        this.toastService.showToast('success', 'Éxito', 'Prompt creado exitosamente');
        this.cancelEdit();
      },
      error: (err: any) => {
        console.error('Error creating prompt:', err);
        this.toastService.showToast('error', 'Error', 'Error al crear prompt');
      },
    });
  }

  updatePrompt(): void {
    if (!this.selectedPrompt) return;
    this.promptService
      .updatePrompt(this.selectedPrompt.id, this.form as PromptUpdate)
      .subscribe({
        next: (updated: Prompt) => {
          const index = this.prompts.findIndex((p: Prompt) => p.id === updated.id);
          if (index !== -1) {
            this.prompts[index] = updated;
          }
          this.applyFilters();
          this.toastService.showToast('success', 'Éxito', 'Prompt actualizado exitosamente');
          this.selectedPrompt = updated;
          this.isEditing = false;
        },
        error: (err: any) => {
          console.error('Error updating prompt:', err);
          this.toastService.showToast('error', 'Error', 'Error al actualizar prompt');
        },
      });
  }

  deletePrompt(prompt: Prompt): void {
    if (!confirm(`¿Estás seguro de eliminar el prompt "${prompt.name}"?`)) return;
    this.promptService.deletePrompt(prompt.id).subscribe({
      next: () => {
        this.prompts = this.prompts.filter((p: Prompt) => p.id !== prompt.id);
        this.applyFilters();
        this.toastService.showToast('success', 'Éxito', 'Prompt eliminado exitosamente');
        if (this.selectedPrompt?.id === prompt.id) {
          this.selectedPrompt = null;
        }
      },
      error: (err: any) => {
        console.error('Error deleting prompt:', err);
        this.toastService.showToast('error', 'Error', 'Error al eliminar prompt');
      },
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isCreating = false;
    this.form = {
      name: '',
      category: 'general',
      template: '',
      description: '',
      variables: [],
      is_active: true,
    };
  }

  extractVariables(): void {
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const matches = this.form.template?.matchAll(regex);
    const variables = new Set<string>();

    if (matches) {
      for (const match of matches) {
        variables.add(match[1]);
      }
    }
    this.form.variables = Array.from(variables);
  }
}
