import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { EvaluationCreateComponent } from './evaluation-create/evaluation-create.component';
import { EvaluationDashboardComponent } from './evaluation-dashboard/evaluation-dashboard.component';
import { EvaluationDetailComponent } from './evaluation-detail/evaluation-detail.component';
import { EvaluationUpdateComponent } from './evaluation-update/evaluation-update.component';

export const evaluationRoutes: Routes = [
  {
    path: '',
    component: EvaluationDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1, 2, 3], title: 'Encuestas' },
  },
  {
    path: 'create',
    component: EvaluationCreateComponent,
    canActivate: [authGuard],
    data: { role: [3], title: 'Registrar Encuesta' },
  },
  {
    path: 'update/:id',
    component: EvaluationUpdateComponent,
    canActivate: [authGuard],
    data: { role: [3], title: 'Editar Encuesta' },
  },
  {
    path: 'detail/:id',
    component: EvaluationDetailComponent,
    canActivate: [authGuard],
    data: { role: [1, 2, 3], title: 'Ver Encuesta' },
  },
];
