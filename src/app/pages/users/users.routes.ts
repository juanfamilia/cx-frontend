import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1], title: 'Usuarios' },
  },
];
