import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { CampaignAssignmentsMenuComponent } from './campaign-assignments/campaign-assignments-menu/campaign-assignments-menu.component';
import { CampaignAssignmentsCreateUserComponent } from './campaign-assignments/users/campaign-assignments-create-user/campaign-assignments-create-user.component';
import { CampaignAssignmentsDashboardUserComponent } from './campaign-assignments/users/campaign-assignments-dashboard-user/campaign-assignments-dashboard-user.component';
import { CampaignAssignmentsCreateZoneComponent } from './campaign-assignments/zones/campaign-assignments-create-zone/campaign-assignments-create-zone.component';
import { CampaignAssignmentsDashboardZoneComponent } from './campaign-assignments/zones/campaign-assignments-dashboard-zone/campaign-assignments-dashboard-zone.component';
import { CampaignCreateComponent } from './campaign-create/campaign-create.component';
import { CampaignDashboardComponent } from './campaign-dashboard/campaign-dashboard.component';
import { CampaignGoalsCreateComponent } from './campaign-goals/campaign-goals-create/campaign-goals-create.component';
import { CampaignGoalsDashboardComponent } from './campaign-goals/campaign-goals-dashboard/campaign-goals-dashboard.component';
import { CampaignGoalsUpdateComponent } from './campaign-goals/campaign-goals-update/campaign-goals-update.component';
import { CampaignUpdateComponent } from './campaign-update/campaign-update.component';

export const campaignRoutes: Routes = [
  {
    path: '',
    component: CampaignDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Campañas' },
  },
  {
    path: 'create',
    component: CampaignCreateComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Crear Campaña' },
  },
  {
    path: 'update/:id',
    component: CampaignUpdateComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Editar Campaña' },
  },
  {
    path: 'assigns',
    component: CampaignAssignmentsMenuComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Asignaciones' },
  },
  {
    path: 'assigns/by-user',
    component: CampaignAssignmentsDashboardUserComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Asignaciones por Usuario' },
  },
  {
    path: 'assigns/by-user/create',
    component: CampaignAssignmentsCreateUserComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Crear Asignación por Usuario' },
  },
  {
    path: 'assigns/by-zones',
    component: CampaignAssignmentsDashboardZoneComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Asignaciones por Zonas' },
  },
  {
    path: 'assigns/by-zones/create',
    component: CampaignAssignmentsCreateZoneComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Crear Asignación por Zonas' },
  },
  {
    path: 'goals',
    component: CampaignGoalsDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Gestionar metas de evaluación' },
  },
  {
    path: 'goals/create',
    component: CampaignGoalsCreateComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Crear nueva meta para evaluador' },
  },
  {
    path: 'goals/update/:id',
    component: CampaignGoalsUpdateComponent,
    canActivate: [authGuard],
    data: { role: [1, 2], title: 'Actualizar meta de evaluador' },
  },
];
