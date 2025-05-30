import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { CampaignCreateComponent } from './campaign-create/campaign-create.component';
import { CampaignDashboardComponent } from './campaign-dashboard/campaign-dashboard.component';
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
];
