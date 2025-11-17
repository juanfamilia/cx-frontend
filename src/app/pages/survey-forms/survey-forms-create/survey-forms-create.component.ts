import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { SurveyFormCreate } from '@interfaces/survey-form';
import { SurveyFormService } from '@services/survey-form.service';
import { ShareToasterService } from '@services/toast.service';
import { SurveyFormsFormComponent } from '../components/survey-forms-form/survey-forms-form.component';

@Component({
  selector: 'app-survey-forms-create',
  imports: [PageHeaderComponent, SurveyFormsFormComponent],
  templateUrl: './survey-forms-create.component.html',
  styleUrl: './survey-forms-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyFormsCreateComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private surveyFormService = inject(SurveyFormService);

  createSurveyForm(data: SurveyFormCreate) {
    this.surveyFormService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Formulario creado',
          'El formulario ha sido creado exitosamente.'
        );
        this.router.navigate(['/survey-forms']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al crear el formulario',
          err.error.detail
        );
        console.error('Error creating survey form:', err);
      },
    });
  }
}
