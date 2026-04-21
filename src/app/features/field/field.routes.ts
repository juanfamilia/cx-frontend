import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { fieldGuard } from '@core/guards/field.guard';

export const fieldRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./field-project-list.component').then(m => m.FieldProjectListComponent),
    canActivate: [authGuard, fieldGuard],
    data: { role: [0, 1, 2], title: 'Siete Field' },
  },
];
