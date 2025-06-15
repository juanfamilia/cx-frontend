import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { NotificationDashboardComponent } from './notification-dashboard/notification-dashboard.component';

export const notificationRoutes: Routes = [
  {
    path: '',
    component: NotificationDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2, 3], title: 'Encuestas' },
  },
];
