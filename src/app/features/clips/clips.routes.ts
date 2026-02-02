import { Routes } from '@angular/router';

export const clipRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./executive-evidence.component').then(m => m.ExecutiveEvidenceComponent),
    data: { role: [0, 1, 2, 3], title: 'Evidence' }
  }
];
