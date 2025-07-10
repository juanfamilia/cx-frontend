import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { UserClass } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import { lucideGoal, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { CampaignGoalsEvaluatorService } from '@services/campaign-goals-evaluator.service';
import { ShareToasterService } from '@services/toast.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-campaign-goals-dashboard',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    TableComponent,
    ButtonSecondaryComponent,
    ButtonDangerComponent,
  ],
  templateUrl: './campaign-goals-dashboard.component.html',
  styleUrl: './campaign-goals-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideGoal, lucidePencil, lucideTrash })],
})
export class CampaignGoalsDashboardComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignGoalsService = inject(CampaignGoalsEvaluatorService);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
    {
      field: 'evaluator.fullName',
      header: 'Evaluador',
      sortable: true,
    },
    {
      field: 'campaign.name',
      header: 'Campaña',
      sortable: true,
    },
    {
      field: 'goal',
      header: 'Meta',
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
      name: 'Evaluador',
      value: 'evaluator',
    },
    {
      name: 'Campaña',
      value: 'campaign',
    },
    {
      name: 'Meta',
      value: 'goal',
    },
  ]);

  goalsResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.campaignGoalsService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  goals = computed(() => {
    const goals = this.goalsResource.value()?.data ?? [];
    return goals.map(goal => {
      goal.evaluator = new UserClass(goal.evaluator);
      return goal;
    });
  });

  createGoal() {
    this.router.navigate(['/campaigns/goals/create']);
  }

  updateGoal(id: number) {
    this.router.navigate(['/campaigns/goals/update/' + id]);
  }

  deleteGoal(id: number) {
    this.campaignGoalsService.delete(id).subscribe({
      next: () => {
        this.goalsResource.reload();
        this.toastService.showToast(
          'success',
          'Meta eliminada',
          'La meta ha sido eliminada exitosamente.'
        );
      },
      error: error => {
        console.error('Error deleting campaign:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar la meta',
          error.message
        );
      },
    });
  }
}
