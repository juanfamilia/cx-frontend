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
import { ButtonSecondaryComponent } from '@shared/components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TableComponent } from '@shared/components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { Campaign } from '@interfaces/campaign';
import { provideIcons } from '@ng-icons/core';
import {
  lucideGoal,
  lucideMegaphone,
  lucidePencil,
  lucideSettings2,
  lucideTrash,
} from '@ng-icons/lucide';
import { ShareToasterService } from '@core/services/toast.service';
import { CampaignService } from '@pages/campaign/campaign.service';
import { Options } from '@data/types/options';
import { PaginatedResponse } from '@data/types/pagination';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-campaign-dashboard',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    TableComponent,
    ButtonSecondaryComponent,
    ButtonDangerComponent,
  ],
  templateUrl: './campaign-dashboard.component.html',
  styleUrl: './campaign-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideMegaphone,
      lucideSettings2,
      lucidePencil,
      lucideTrash,
      lucideGoal,
    }),
  ],
})
export class CampaignDashboardComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignService = inject(CampaignService);

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
      field: 'objective',
      header: 'Objetivo',
      sortable: true,
    },
    {
      field: 'channel',
      header: 'Canal',
      sortable: true,
    },
    {
      field: 'date_start',
      header: 'Fecha de Inicio',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      field: 'date_end',
      header: 'Fecha de Finalización',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      field: 'survey.title',
      header: 'Nombre del formulario',
      sortable: true,
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
      name: 'Objetivo',
      value: 'objective',
    },
    {
      name: 'Nombre del formulario',
      value: 'survey',
    },
  ]);

  campaignResource = rxResource<
  PaginatedResponse<Campaign>,
  { pagination: PaginatorState; search: { filter: string; search: string } | null }
>({
  request: () => ({
    pagination: this.pagination(),
    search: this.searchEvent(),
  }),
  loader: ({ request }) =>
    this.campaignService.getAll(
      request.pagination.first,
      request.pagination.rows,
      request.search?.filter,
      request.search?.search
    ),
});

  createCampaign() {
    this.router.navigate(['/campaigns/create']);
  }

  assignCampaign() {
    this.router.navigate(['/campaigns/assigns']);
  }

  goalsCampaign() {
    this.router.navigate(['/campaigns/goals']);
  }

  updateCampaign(id: number) {
    this.router.navigate(['/campaigns/update/' + id]);
  }

  deleteCampaign(id: number) {
    this.campaignService.delete(id).subscribe({
      next: () => {
        this.campaignResource.reload();
        this.toastService.showToast(
          'success',
          'Campaña eliminada',
          'La campaña ha sido eliminada exitosamente.'
        );
      },
      error: (error: unknown) => {
        console.error('Error deleting campaign:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar la campaña',
          'Ocurrió un error al eliminar la campaña'
        );
      },
    });
  }
}
