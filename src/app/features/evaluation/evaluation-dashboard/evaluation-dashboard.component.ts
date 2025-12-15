import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonDangerComponent } from '@shared/ui/buttons/button-danger/button-danger.component';
import { ButtonPrimaryComponent } from '@shared/ui/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { TableComponent } from '@shared/ui/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { User, UserClass } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import {
  lucideEye,
  lucideFileText,
  lucidePencil,
  lucideTrash,
} from '@ng-icons/lucide';
import { AuthService } from '@core/services/auth.service';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ShareToasterService } from '@core/services/toast.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-evaluation-dashboard',
  imports: [
    PageHeaderComponent,
    TableComponent,
    ButtonSecondaryComponent,
    ButtonDangerComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrl: './evaluation-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideFileText, lucidePencil, lucideTrash, lucideEye }),
  ],
})
export class EvaluationDashboardComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private evaluationService = inject(EvaluationService);
  private authService = inject(AuthService);

  authUser = signal<User>(this.authService.getCurrentUser());

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
    {
      field: 'campaign.name',
      header: 'Campaña',
      sortable: true,
    },
    {
      field: 'user.fullName',
      header: 'Evaluador',
      sortable: true,
    },
    {
      field: 'created_at',
      header: 'Fecha',
      sortable: true,
      pipe: 'date',
      pipeArgs: ['dd/MM/yyyy'],
    },
    {
      field: 'location',
      header: 'Ubicación',
      sortable: true,
      pipe: 'state',
    },
    {
      field: 'status',
      header: 'Estado',
      sortable: true,
      pipe: 'severity',
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);

  filters = signal<Options[]>([
    {
      name: 'Campaña',
      value: 'campaign',
    },
    {
      name: 'Evaluador',
      value: 'evaluator',
    },
  ]);

  evaluationsResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.evaluationService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  data = computed(() => {
    const evaluations = this.evaluationsResource.value()?.data ?? [];
    return evaluations.map(evaluation => {
      evaluation.user = new UserClass(evaluation.user);
      if (evaluation.location === null || evaluation.location === 'null') {
        evaluation.location = 'N/A';
      }
      return evaluation;
    });
  });

  createEvaluation() {
    this.router.navigate(['/evaluations/create']);
  }

  detailEvaluation(id: number) {
    this.router.navigate(['/evaluations/detail/' + id]);
  }

  updateEvaluation(id: number) {
    this.router.navigate(['/evaluations/update/' + id]);
  }

  deleteEvaluation(id: number) {
    this.evaluationService.delete(id).subscribe({
      next: () => {
        this.evaluationsResource.reload();
        this.toastService.showToast(
          'success',
          'Evaluación eliminada',
          'La evaluación ha sido eliminada exitosamente.'
        );
      },
      error: error => {
        console.error('Error deleting evaluation:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar la evaluación',
          error.message
        );
      },
    });
  }
}
