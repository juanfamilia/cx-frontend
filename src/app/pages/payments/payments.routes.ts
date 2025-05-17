import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { PaymentsDashboardComponent } from './payments-dashboard/payments-dashboard.component';

export const paymentsRoutes: Routes = [
  {
    path: '',
    component: PaymentsDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Pagos' },
  },
];
