import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { ConfigurationDashboardComponent } from './configuration-dashboard/configuration-dashboard.component';
import { ConfigurationQualityComponent } from './configuration-quality/configuration-quality.component';

export const configurationRoutes: Routes = [
  {
    path: '',
    component: ConfigurationDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2, 3], title: 'Configuración' },
  },
  {
    path: 'quality',
    component: ConfigurationQualityComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Marco de calidad' },
  },
];
