import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { PromptManagerComponent } from './prompt-manager.component';

export const promptManagerRoutes: Routes = [
  {
    path: '',
    component: PromptManagerComponent,
    canActivate: [authGuard],
    data: { role: [0, 1], title: 'Gestor de Prompts' },
  },
];
