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
import { CompaniesService } from '@services/companies.service';
import { ShareToasterService } from '@services/toast.service';

@Component({
  selector: 'app-companies-dashboard',
  imports: [
    PageHeaderComponent,
    TableComponent,
    ButtonSecondaryComponent,
    ButtonDangerComponent,
  ],
  templateUrl: './companies-dashboard.component.html',
  styleUrl: './companies-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucidePencil, lucideTrash })],
})
export class CompaniesDashboardComponent {
  private companyService = inject(CompaniesService);
  private toastService = inject(ShareToasterService);

  companiesResource = rxResource({
    loader: () => this.companyService.getAll(),
  });

  columns = signal<TableColumn[]>([
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
      pipe: 'state',
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);

  deleteCompany = (id: number) => {
    this.companyService.delete(id).subscribe({
      next: () => {
        this.companiesResource.reload();
        this.toastService.showToast(
          'success',
          'Empresa eliminada',
          'La empresa ha sido eliminada exitosamente.'
        );
      },
      error: error => {
        console.error('Error deleting company:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar empresa',
          error.message
        );
      },
    });
  };
}
