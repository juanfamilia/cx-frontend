import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { WorkAreaCreateComponent } from './work-area-create/work-area-create.component';
import { WorkAreasDashboardComponent } from './work-areas-dashboard/work-areas-dashboard.component';

export const workAreasRoutes: Routes = [
  {
    path: '',
    component: WorkAreasDashboardComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Areas de Trabajo' },
  },
  {
    path: 'create',
    component: WorkAreaCreateComponent,
    canActivate: [authGuard],
    data: { role: [1], title: 'Crear Area de Trabajo' },
  },
  // {
  //   path: 'update/:id',
  //   component: WorkAreaUpdateComponent,
  //   canActivate: [authGuard],
  //   data: { role: [1], title: 'Editar Area de Trabajo' },
  // },
];
