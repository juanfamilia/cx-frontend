import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { insGuard } from '@core/guards/ins.guard';

export const insRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ins-study-list.component').then(m => m.InsStudyListComponent),
    canActivate: [authGuard, insGuard],
    data: { role: [0, 1, 2, 3], title: 'Siete InS' },
  },
];
