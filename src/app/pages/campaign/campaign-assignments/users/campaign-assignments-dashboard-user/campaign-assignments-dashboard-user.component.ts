import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonDangerComponent } from '@shared/components/buttons/button-danger/button-danger.component';
import { ButtonPrimaryComponent } from '@shared/components/buttons/button-primary/button-primary.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TableComponent } from '@shared/components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { ShareToasterService } from '@core/services/toast.service';
import { CampaignAssignmentsUserService } from '@pages/campaign/campaign-assignments-user.service';
import { Options } from '@data/types/options';
import { PaginatedResponse } from '@data/types/pagination';
import { provideIcons } from '@ng-icons/core';
import { lucideSettings2, lucideTrash } from '@ng-icons/lucide';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-campaign-assignments-dashboard-user',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    TableComponent,
    ButtonDangerComponent,
  ],
  templateUrl: './campaign-assignments-dashboard-user.component.html',
  styleUrl: './campaign-assignments-dashboard-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideSettings2, lucideTrash })],
})
export class CampaignAssignmentsDashboardUserComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignAssignmentsUserService = inject(CampaignAssignmentsUserService);

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
      header: 'Apellidos',
      sortable: true,
    },
    {
      field: 'campaign.name',
      header: 'Campaña',
      sortable: true,
    },
    {
      field: 'campaign.date_start',
      header: 'Fecha de Inicio',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      field: 'campaign.date_end',
      header: 'Fecha de Finalización',
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
      name: 'Nombre y Apellido',
      value: 'full_name',
    },
    {
      name: 'Campaña',
      value: 'campaign',
    },
  ]);

  campaignAssignmentsUserResource = rxResource<
    PaginatedResponse<unknown>,
    { pagination: PaginatorState; search: { filter: string; search: string } | null }
  >({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.campaignAssignmentsUserService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createAsignment() {
    this.router.navigate(['/campaigns/assigns/by-user/create']);
  }

  deleteAssignment(id: number) {
    this.campaignAssignmentsUserService.delete(id).subscribe({
      next: () => {
        this.campaignAssignmentsUserResource.reload();
        this.toastService.showToast(
          'success',
          'Asignación eliminada',
          'La asignación ha sido eliminada exitosamente.'
        );
      },
      error: (error: unknown) => {
        console.error('Error deleting campaign assignment:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar la asignación',
          'Ocurrió un error al eliminar la asignación'
        );
      },
    });
  }
}
