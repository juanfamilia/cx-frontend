import { Routes } from '@angular/router';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LoginComponent } from '@pages/login/login.component';
import { NotFoundComponent } from '@pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2, 3] },
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./pages/users/users.routes').then(r => r.userRoutes),
    data: { title: 'Usuarios' },
  },
  {
    path: 'companies',
    loadChildren: () =>
      import('./pages/companies/companies.routes').then(r => r.companiesRoutes),
    data: { title: 'Empresas' },
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./pages/payments/payments.routes').then(r => r.paymentsRoutes),
    data: { title: 'Pagos' },
  },
  {
    path: 'configuration',
    loadChildren: () =>
      import('./pages/configuration/configuration.routes').then(
        r => r.configurationRoutes
      ),
    data: { title: 'Configuración' },
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
