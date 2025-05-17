import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { ConfigurationDashboardComponent } from './configuration-dashboard/configuration-dashboard.component';

export const configurationRoutes: Routes = [
  {
    path: '',
    component: ConfigurationDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2, 3], title: 'Configuración' },
  },
];
