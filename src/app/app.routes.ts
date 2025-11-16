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
    path: 'work-areas',
    loadChildren: () =>
      import('./pages/work-areas/work-areas.routes').then(
        r => r.workAreasRoutes
      ),
    data: { title: 'Areas de Trabajo' },
  },
  {
    path: 'survey-forms',
    loadChildren: () =>
      import('./pages/survey-forms/survey-forms.routes').then(
        r => r.surveyFormsRoutes
      ),
    data: { title: 'Formularios de Encuestas' },
  },
  {
    path: 'campaigns',
    loadChildren: () =>
      import('./pages/campaign/campaign.routes').then(r => r.campaignRoutes),
    data: { title: 'Campañas' },
  },
  {
    path: 'evaluations',
    loadChildren: () =>
      import('./pages/evaluation/evaluation.routes').then(
        r => r.evaluationRoutes
      ),
    data: { title: 'Evaluaciones' },
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./pages/notifications/notification.routes').then(
        r => r.notificationRoutes
      ),
    data: { title: 'Notificaciones' },
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
    path: 'intelligence',
    loadComponent: () =>
      import('./pages/intelligence/intelligence-dashboard.component').then(
        m => m.IntelligenceDashboardComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Intelligence CX', role: [0, 1] },
  },
  {
    path: 'prompts',
    loadComponent: () =>
      import('./pages/prompt-manager/prompt-manager.component').then(
        m => m.PromptManagerComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Gestor de Prompts', role: [0, 1] },
  },
  {
    path: 'dashboard-config',
    loadComponent: () =>
      import('./pages/dashboard-configurator/dashboard-configurator.component').then(
        m => m.DashboardConfiguratorComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Configurador de Dashboards', role: [0] },
  },
  {
    path: 'theme',
    loadComponent: () =>
      import('./pages/theme-manager/theme-manager.component').then(
        m => m.ThemeManagerComponent
      ),
    canActivate: [authGuard],
    data: { title: 'Gestor de Temas', role: [0, 1] },
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
