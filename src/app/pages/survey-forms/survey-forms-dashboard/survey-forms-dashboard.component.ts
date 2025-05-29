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
import {
  lucidePencil,
  lucideTextCursorInput,
  lucideTrash,
} from '@ng-icons/lucide';
import { SurveyFormService } from '@services/survey-form.service';
import { ShareToasterService } from '@services/toast.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-survey-forms-dashboard',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    TableComponent,
    ButtonDangerComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './survey-forms-dashboard.component.html',
  styleUrl: './survey-forms-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideTextCursorInput, lucidePencil, lucideTrash }),
  ],
})
export class SurveyFormsDashboardComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private surveyFormService = inject(SurveyFormService);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
    {
      field: 'title',
      header: 'Titulo',
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
      name: 'Titulo',
      value: 'title',
    },
  ]);

  surveyFormsResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.surveyFormService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createSurveyForm() {
    this.router.navigate(['/survey-forms/create']);
  }

  updateSurveyForm(id: number) {
    this.router.navigate(['/survey-forms/update/' + id]);
  }

  deleteSurveyForm(id: number) {
    this.surveyFormService.delete(id).subscribe({
      next: () => {
        this.surveyFormsResource.reload();
        this.toastService.showToast(
          'success',
          'Formulario eliminado',
          'El formulario de encuesta ha sido eliminado exitosamente.'
        );
      },
      error: error => {
        console.error('Error deleting survey form:', error);
        this.toastService.showToast(
          'error',
          'Error al eliminar el formulario',
          error.message
        );
      },
    });
  }
}
