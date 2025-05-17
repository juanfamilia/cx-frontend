import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { PaymentsService } from '@services/payments.service';

@Component({
  selector: 'app-payments-dashboard',
  imports: [PageHeaderComponent, TableComponent],
  templateUrl: './payments-dashboard.component.html',
  styleUrl: './payments-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsDashboardComponent {
  private paymentService = inject(PaymentsService);

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
}
