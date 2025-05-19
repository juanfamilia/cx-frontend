import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserUpdateComponent } from './user-update/user-update.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1], title: 'Usuarios' },
  },
  {
    path: 'create',
    component: UserCreateComponent,
    canActivate: [authGuard],
    data: { role: [0, 1], title: 'Crear Usuario' },
  },
  {
    path: 'update/:id',
    component: UserUpdateComponent,
    canActivate: [authGuard],
    data: { role: [0, 1], title: 'Editar Usuario' },
  },
];
