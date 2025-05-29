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
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { provideIcons } from '@ng-icons/core';
import { lucideMap, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ShareToasterService } from '@services/toast.service';
import { UserZoneService } from '@services/user-zone.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-work-areas-dashboard',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    TableComponent,
    ButtonDangerComponent,
  ],
  templateUrl: './work-areas-dashboard.component.html',
  styleUrl: './work-areas-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideMap, lucidePencil, lucideTrash })],
})
export class WorkAreasDashboardComponent {
  private router = inject(Router);
  private userZoneService = inject(UserZoneService);
  private toastService = inject(ShareToasterService);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
    {
      field: 'user.first_name',
      header: 'Nombre(s)',
      sortable: true,
    },
    {
      field: 'user.last_name',
      header: 'Apellido(s)',
      sortable: true,
    },
    {
      field: 'zone.value',
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
      name: 'Estado',
      value: 'zone',
    },
  ]);

  userZonesResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.userZoneService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createWorkArea() {
    this.router.navigate(['/work-areas/create']);
  }

  updateWorkArea(id: number) {
    this.router.navigate(['/work-areas/update/' + id]);
  }

  deleteWorkArea(id: number) {
    this.userZoneService.delete(id).subscribe({
      next: () => {
        this.userZonesResource.reload();
        this.toastService.showToast(
          'success',
          'Area de Trabajo eliminada',
          'La area de trabajo ha sido eliminada exitosamente.'
        );
      },
      error: error => {
        console.error('Error deleting work area:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar la area de trabajo',
          error.message
        );
      },
    });
  }
}
