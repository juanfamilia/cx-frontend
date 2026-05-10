import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { fieldGuard } from '@core/guards/field.guard';

const fieldRoleData = { role: [0, 1, 2] as const };

export const fieldRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./field-landing.component').then(m => m.FieldLandingComponent),
    canActivate: [authGuard, fieldGuard],
    data: { ...fieldRoleData, title: 'Siete Field' },
  },
  {
    path: 'trabajo',
    loadComponent: () =>
      import('./field-project-list.component').then(m => m.FieldProjectListComponent),
    canActivate: [authGuard, fieldGuard],
    data: { ...fieldRoleData, title: 'Field — Operaciones y asistente' },
  },
  {
    path: 'conectores',
    loadComponent: () =>
      import('./field-connector-hub.component').then(m => m.FieldConnectorHubComponent),
    canActivate: [authGuard, fieldGuard],
    data: { ...fieldRoleData, title: 'Field — Fuentes de datos' },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./field-project-selector.component').then(m => m.FieldProjectSelectorComponent),
    canActivate: [authGuard, fieldGuard],
    data: { ...fieldRoleData, title: 'Field — Resumen de proyectos' },
  },
  {
    path: 'project/:projectId',
    loadComponent: () => import('./field-shell.component').then(m => m.FieldShellComponent),
    canActivate: [authGuard, fieldGuard],
    data: { ...fieldRoleData, title: 'Field — Detalle de proyecto' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./field-control-dashboard.component').then(m => m.FieldControlDashboardComponent),
        data: { ...fieldRoleData, title: 'Field — Control del proyecto' },
      },
      {
        path: 'findings',
        loadComponent: () =>
          import('./field-findings-list-page.component').then(m => m.FieldFindingsListPageComponent),
        data: { ...fieldRoleData, title: 'Field — Hallazgos' },
      },
      {
        path: 'scoring',
        loadComponent: () =>
          import('./field-scoring-breakdown.component').then(m => m.FieldScoringBreakdownComponent),
        data: { ...fieldRoleData, title: 'Field — Métricas y scoring' },
      },
      {
        path: 'executive-summary',
        loadComponent: () =>
          import('./field-executive-summary.component').then(m => m.FieldExecutiveSummaryComponent),
        data: { ...fieldRoleData, title: 'Field — Resumen ejecutivo' },
      },
      {
        path: 'pre-field',
        loadComponent: () =>
          import('./field-pre-field.component').then(m => m.FieldPreFieldComponent),
        data: { ...fieldRoleData, title: 'Field — PRE-FIELD (instrumento)' },
      },
    ],
  },
];
