import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { SurveyFormCreate, SurveyFormDetail } from '@interfaces/survey-form';
import { SurveyFormService } from '@services/survey-form.service';
import { ShareToasterService } from '@services/toast.service';
import { SurveyFormsFormComponent } from '../components/survey-forms-form/survey-forms-form.component';

@Component({
  selector: 'app-survey-forms-update',
  imports: [PageHeaderComponent, SurveyFormsFormComponent, SpinnerComponent],
  templateUrl: './survey-forms-update.component.html',
  styleUrl: './survey-forms-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyFormsUpdateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private surveyFormService = inject(SurveyFormService);

  id = signal<number>(0);
  surveyForm = signal<SurveyFormDetail | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.surveyFormService.getOne(this.id()).subscribe({
        next: data => {
          this.surveyForm.set(data);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener el formulario',
            err.message
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updateSurveyForm(data: SurveyFormCreate) {
    this.surveyFormService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Formulario actualizado',
          'El formulario ha sido actualizado exitosamente.'
        );
        this.router.navigate(['/survey-forms']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar el formulario',
          err.message
        );
        console.error('Error updating survey form:', err);
      },
    });
  }
}
