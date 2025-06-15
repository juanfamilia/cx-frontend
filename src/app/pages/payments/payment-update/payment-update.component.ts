import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { Payment, PaymentCreate } from '@interfaces/payments';
import { PaymentsService } from '@services/payments.service';
import { ShareToasterService } from '@services/toast.service';
import { PaymentFormComponent } from '../components/payment-form/payment-form.component';

@Component({
  selector: 'app-payment-update',
  imports: [PageHeaderComponent, PaymentFormComponent, SpinnerComponent],
  templateUrl: './payment-update.component.html',
  styleUrl: './payment-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentUpdateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private paymentService = inject(PaymentsService);

  id = signal<number>(0);
  payment = signal<Payment | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.paymentService.getOne(this.id()).subscribe({
        next: user => {
          this.payment.set(user);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener el pago',
            err.message
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updatePayment(data: PaymentCreate) {
    this.paymentService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Pago actualizado',
          'El pago ha sido actualizado exitosamente.'
        );
        this.router.navigate(['/payments']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar el pago',
          err.message
        );
        console.error('Error updating payment:', err);
      },
    });
  }
}
