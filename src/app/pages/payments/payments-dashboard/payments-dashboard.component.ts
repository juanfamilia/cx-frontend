import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonDangerComponent } from '@components/buttons/button-danger/button-danger.component';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { provideIcons } from '@ng-icons/core';
import { lucideBanknote, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { PaymentsService } from '@services/payments.service';
import { ShareToasterService } from '@services/toast.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-payments-dashboard',
  imports: [
    PageHeaderComponent,
    TableComponent,
    ButtonDangerComponent,
    ButtonSecondaryComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './payments-dashboard.component.html',
  styleUrl: './payments-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideBanknote, lucidePencil, lucideTrash })],
})
export class PaymentsDashboardComponent {
  private router = inject(Router);
  private paymentService = inject(PaymentsService);
  private toastService = inject(ShareToasterService);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
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
      header: 'Vencimiento',
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

  filters = signal<Options[]>([
    {
      name: 'Empresa',
      value: 'company',
    },
    {
      name: 'Monto',
      value: 'amount',
    },
    {
      name: 'Fecha de pago',
      value: 'date',
    },
    {
      name: 'Vencimiento',
      value: 'valid_before',
    },
  ]);

  paymentsResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.paymentService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createPayment() {
    this.router.navigate(['/payments/create']);
  }

  updatePayment(id: number) {
    this.router.navigate(['/payments/update/' + id]);
  }

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
