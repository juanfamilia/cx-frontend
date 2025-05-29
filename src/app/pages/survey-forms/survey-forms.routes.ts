import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { SurveyFormsCreateComponent } from './survey-forms-create/survey-forms-create.component';
import { SurveyFormsDashboardComponent } from './survey-forms-dashboard/survey-forms-dashboard.component';
import { SurveyFormsUpdateComponent } from './survey-forms-update/survey-forms-update.component';

export const surveyFormsRoutes: Routes = [
  {
    path: '',
    component: SurveyFormsDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Formularios de Encuestas' },
  },
  {
    path: 'create',
    component: SurveyFormsCreateComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Crear Formulario' },
  },
  {
    path: 'update/:id',
    component: SurveyFormsUpdateComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Editar Formulario' },
  },
];
