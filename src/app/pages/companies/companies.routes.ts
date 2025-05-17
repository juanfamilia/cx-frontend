import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { CompaniesDashboardComponent } from './companies-dashboard/companies-dashboard.component';

export const companiesRoutes: Routes = [
  {
    path: '',
    component: CompaniesDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Empresas' },
  },
];
