import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from '@pages/login/login.component';
import { NotFoundComponent } from '@pages/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2, 3] },
  },
  {
    path: 'dashboard',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'zones',
    redirectTo: 'work-areas',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(r => r.userRoutes),
    data: { title: 'Usuarios' },
  },
  {
    path: 'companies',
    loadChildren: () =>
      import('./features/companies/companies.routes').then(r => r.companiesRoutes),
    data: { title: 'Empresas' },
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then(r => r.paymentsRoutes),
    data: { title: 'Pagos' },
  },
  {
    path: 'work-areas',
    loadChildren: () =>
      import('./features/work-areas/work-areas.routes').then(
        r => r.workAreasRoutes
      ),
    data: { title: 'Areas de Trabajo' },
  },
  {
    path: 'survey-forms',
    loadChildren: () =>
      import('./features/survey-forms/survey-forms.routes').then(
        r => r.surveyFormsRoutes
      ),
    data: { title: 'Formularios de Encuestas' },
  },
  {
    path: 'campaigns',
    loadChildren: () =>
      import('./features/campaign/campaign.routes').then(r => r.campaignRoutes),
    data: { title: 'Campañas' },
  },
  {
    path: 'evaluations',
    loadChildren: () =>
      import('./features/evaluation/evaluation.routes').then(
        r => r.evaluationRoutes
      ),
    data: { title: 'Evaluaciones' },
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./features/notifications/notification.routes').then(
        r => r.notificationRoutes
      ),
    data: { title: 'Notificaciones' },
  },
  {
    path: 'configuration',
    loadChildren: () =>
      import('./features/configuration/configuration.routes').then(
        r => r.configurationRoutes
      ),
    data: { title: 'Configuración' },
  },
  {
    path: 'prompts',
    loadChildren: () =>
      import('./features/prompt-manager/prompt-manager.routes').then(
        r => r.promptManagerRoutes
      ),
    data: { title: 'Gestor de Prompts' },
  },
  {
    path: 'intelligence',
    loadChildren: () =>
      import('./features/intelligence/intelligence.routes').then(
        r => r.intelligenceRoutes
      ),
    data: { title: 'Intelligence Dashboard' },
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
