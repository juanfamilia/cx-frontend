import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { PaymentCreateComponent } from './payment-create/payment-create.component';
import { PaymentUpdateComponent } from './payment-update/payment-update.component';
import { PaymentsDashboardComponent } from './payments-dashboard/payments-dashboard.component';

export const paymentsRoutes: Routes = [
  {
    path: '',
    component: PaymentsDashboardComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Pagos' },
  },
  {
    path: 'create',
    component: PaymentCreateComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Registrar Pago' },
  },
  {
    path: 'update/:id',
    component: PaymentUpdateComponent,
    canActivate: [authGuard],
    data: { role: [0], title: 'Editar Pago' },
  },
];
