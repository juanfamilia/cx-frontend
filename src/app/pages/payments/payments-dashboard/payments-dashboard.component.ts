import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonDangerComponent } from '@components/buttons/button-danger/button-danger.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { PaymentsService } from '@services/payments.service';
import { ShareToasterService } from '@services/toast.service';

@Component({
  selector: 'app-payments-dashboard',
  imports: [
    PageHeaderComponent,
    TableComponent,
    ButtonDangerComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './payments-dashboard.component.html',
  styleUrl: './payments-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucidePencil, lucideTrash })],
})
export class PaymentsDashboardComponent {
  private paymentService = inject(PaymentsService);
  private toastService = inject(ShareToasterService);

  paymentsResource = rxResource({
    loader: () => this.paymentService.getAll(),
  });

  columns = signal<TableColumn[]>([
    {
      field: 'id',
      header: 'ID',
    },
    {
      field: 'company.name',
      header: 'Empresa',
      sortable: true,
    },
    {
      field: 'amount',
      header: 'Monto',
      sortable: true,
      pipe: 'currency',
      pipeArgs: ['USD', 'symbol-narrow'],
    },
    {
      field: 'date',
      header: 'Fecha de pago',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      field: 'valid_before',
      header: 'Valido Hasta',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);

  deletePayment(id: number) {
    this.paymentService.delete(id).subscribe({
      next: () => {
        this.paymentsResource.reload();
        this.toastService.showToast(
          'success',
          'Pago eliminado',
          'El pago ha sido eliminado exitosamente.'
        );
      },
      error: err => {
        console.error('Error deleting payment:', err);
        this.toastService.showToast(
          'error',
          'Error al eliminar pago',
          err.message
        );
      },
    });
  }
}
