import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { cleverGuard } from '@core/guards/clever.guard';

export const cleverRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./clever-home.component').then(m => m.CleverHomeComponent),
    canActivate: [authGuard, cleverGuard],
    data: { role: [0, 1, 2], title: 'Siete Clever' },
  },
];
