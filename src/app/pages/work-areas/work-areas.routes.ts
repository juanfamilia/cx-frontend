import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { WorkAreasDashboardComponent } from './work-areas-dashboard/work-areas-dashboard.component';

export const workAreasRoutes: Routes = [
  {
    path: '',
    component: WorkAreasDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Areas de Trabajo' },
  },
];
