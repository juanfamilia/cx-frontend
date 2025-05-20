import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { CompaniesDashboardComponent } from './companies-dashboard/companies-dashboard.component';
import { CompanyCreateComponent } from './company-create/company-create.component';
import { CompanyUpdateComponent } from './company-update/company-update.component';

export const companiesRoutes: Routes = [
  {
    path: '',
    component: CompaniesDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Empresas' },
  },
  {
    path: 'create',
    component: CompanyCreateComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Crear Empresa' },
  },
  {
    path: 'update/:id',
    component: CompanyUpdateComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Editar Empresa' },
  },
];
