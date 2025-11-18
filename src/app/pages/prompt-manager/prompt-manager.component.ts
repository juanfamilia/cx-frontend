import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PromptManagerService, Prompt, PromptCreate, PromptUpdate, PromptsResponse
} from '../../services/prompt-manager.service';
import { ShareToasterService } from '../../services/toast.service';

@Component({
  selector: 'app-prompt-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-manager.component.html',
  styleUrls: ['./prompt-manager.component.scss']
})
export class PromptManagerComponent implements OnInit {
  prompts: Prompt[] = [];
  filteredPrompts: Prompt[] = [];
  selectedPrompt: Prompt | null = null;
  isEditing = false;
  isCreating = false;
  loading = true;

  // Form data con campos CORRECTOS del modelo/backend
  form: PromptCreate | PromptUpdate = {
    prompt_name: '',
    prompt_type: 'general',
    system_prompt: '',
    description: '',
    variables: [],
    is_active: true
  };

  // Filtros
  filterType: string = '';
  filterActive: string = '';
  searchTerm: string = '';

  categories = ['general', 'evaluation', 'notification', 'analysis', 'report'];

  constructor(
    private promptService: PromptManagerService,
    private toastService: ShareToasterService
  ) {}

  ngOnInit(): void {
    this.loadPrompts();
  }

  loadPrompts(): void {
    this.loading = true;
    this.promptService.getPrompts().subscribe({
      next: (response: PromptsResponse) => {
        this.prompts = Array.isArray(response?.data) ? response.data : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading prompts:', err);
        this.toastService.showError('Error al cargar prompts');
        this.prompts = [];
        this.filteredPrompts = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = Array.isArray(this.prompts) ? [...this.prompts] : [];
    if (this.filterType) {
      filtered = filtered.filter((p: Prompt) => p.prompt_type === this.filterType);
    }
    if (this.filterActive === 'true') {
      filtered = filtered.filter((p: Prompt) => p.is_active);
    } else if (this.filterActive === 'false') {
      filtered = filtered.filter((p: Prompt) => !p.is_active);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((p: Prompt) =>
        p.prompt_name.toLowerCase().includes(term) ||
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
      prompt_name: prompt.prompt_name,
      prompt_type: prompt.prompt_type,
      system_prompt: prompt.system_prompt,
      description: prompt.description || '',
      variables: [...(prompt.variables ?? [])],
      is_active: prompt.is_active
    };
  }

  startCreate(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedPrompt = null;
    this.form = {
      prompt_name: '',
      prompt_type: 'general',
      system_prompt: '',
      description: '',
      variables: [],
      is_active: true
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
        this.toastService.showSuccess('Prompt creado exitosamente');
        this.cancelEdit();
      },
      error: (err: any) => {
        console.error('Error creating prompt:', err);
        this.toastService.showError('Error al crear prompt');
      }
    });
  }

  updatePrompt(): void {
    if (!this.selectedPrompt) return;
    this.promptService.updatePrompt(this.selectedPrompt.id, this.form as PromptUpdate).subscribe({
      next: (updated: Prompt) => {
        const index = this.prompts.findIndex((p: Prompt) => p.id === updated.id);
        if (index !== -1) {
          this.prompts[index] = updated;
        }
        this.applyFilters();
        this.toastService.showSuccess('Prompt actualizado exitosamente');
        this.selectedPrompt = updated;
        this.isEditing = false;
      },
      error: (err: any) => {
        console.error('Error updating prompt:', err);
        this.toastService.showError('Error al actualizar prompt');
      }
    });
  }

  deletePrompt(prompt: Prompt): void {
    if (!confirm(`¿Estás seguro de eliminar el prompt "${prompt.prompt_name}"?`)) return;
    this.promptService.deletePrompt(prompt.id).subscribe({
      next: () => {
        this.prompts = this.prompts.filter((p: Prompt) => p.id !== prompt.id);
        this.applyFilters();
        this.toastService.showSuccess('Prompt eliminado exitosamente');
        if (this.selectedPrompt?.id === prompt.id) {
          this.selectedPrompt = null;
        }
      },
      error: (err: any) => {
        console.error('Error deleting prompt:', err);
        this.toastService.showError('Error al eliminar prompt');
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isCreating = false;
    this.form = {
      prompt_name: '',
      prompt_type: 'general',
      system_prompt: '',
      description: '',
      variables: [],
      is_active: true
    };
  }

  extractVariables(): void {
    const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    const matches = this.form.system_prompt?.matchAll(regex);
    const variables = new Set<string>();

    if (matches) {
      for (const match of matches) {
        variables.add(match[1]);
      }
    }
    this.form.variables = Array.from(variables);
  }
}
