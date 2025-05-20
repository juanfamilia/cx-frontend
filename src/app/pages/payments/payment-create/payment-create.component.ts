import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { PaymentCreate } from '@interfaces/payments';
import { PaymentsService } from '@services/payments.service';
import { ShareToasterService } from '@services/toast.service';
import { PaymentFormComponent } from '../components/payment-form/payment-form.component';

@Component({
  selector: 'app-payment-create',
  imports: [PageHeaderComponent, PaymentFormComponent],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCreateComponent {
  private paymentService = inject(PaymentsService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);

  createPayment(data: PaymentCreate) {
    this.paymentService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Pago registrado',
          'El pago ha sido registrado exitosamente.'
        );
        this.router.navigate(['/payments']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al registrar el pago',
          err.message
        );
        console.error('Error creating payment:', err);
      },
    });
  }
}
