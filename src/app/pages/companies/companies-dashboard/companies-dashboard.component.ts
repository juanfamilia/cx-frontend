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
import { CompaniesService } from '@services/companies.service';

@Component({
  selector: 'app-companies-dashboard',
  imports: [PageHeaderComponent, TableComponent],
  templateUrl: './companies-dashboard.component.html',
  styleUrl: './companies-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesDashboardComponent {
  private companyService = inject(CompaniesService);

  companiesResource = rxResource({
    loader: () => this.companyService.getAll(),
  });

  columns = signal<TableColumn[]>([
    {
      field: 'id',
      header: 'ID',
    },
    {
      field: 'name',
      header: 'Nombre',
      sortable: true,
    },
    {
      field: 'phone',
      header: 'Teléfono',
      sortable: true,
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      field: 'state',
      header: 'Estado',
      sortable: true,
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);
}
