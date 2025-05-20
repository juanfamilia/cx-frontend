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
import { lucideBuilding2, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { CompaniesService } from '@services/companies.service';
import { ShareToasterService } from '@services/toast.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';
@Component({
  selector: 'app-companies-dashboard',
  imports: [
    PageHeaderComponent,
    TableComponent,
    ButtonSecondaryComponent,
    ButtonDangerComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './companies-dashboard.component.html',
  styleUrl: './companies-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideBuilding2, lucidePencil, lucideTrash })],
})
export class CompaniesDashboardComponent {
  private companyService = inject(CompaniesService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

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

  filters = signal<Options[]>([
    {
      name: 'Nombre',
      value: 'name',
    },
    {
      name: 'Teléfono',
      value: 'phone',
    },
    {
      name: 'Correo Electrónico',
      value: 'email',
    },
  ]);

  companiesResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.companyService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createCompany() {
    this.router.navigate(['/companies/create']);
  }

  updateCompany(id: number) {
    this.router.navigate(['/companies/update/' + id]);
  }

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
          'Error al eliminar la empresa',
          error.message
        );
      },
    });
  };
}
