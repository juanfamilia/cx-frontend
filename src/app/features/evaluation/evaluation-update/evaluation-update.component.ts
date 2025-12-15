import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';
import { Evaluation } from '@interfaces/evaluation';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ShareToasterService } from '@core/services/toast.service';
import { EvaluationFormComponent } from '../components/evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation-update',
  imports: [PageHeaderComponent, EvaluationFormComponent, SpinnerComponent],
  templateUrl: './evaluation-update.component.html',
  styleUrl: './evaluation-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationUpdateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private evaluationService = inject(EvaluationService);

  id = signal<number>(0);
  evaluation = signal<Evaluation | null>(null);

  isLoading = signal<boolean>(false);
  isLoadingSubmit = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.evaluationService.getOne(this.id()).subscribe({
        next: data => {
          this.evaluation.set(data);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener la evaluación',
            err.message
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updateEvaluation(data: FormData) {
    this.isLoadingSubmit.set(true);
    this.evaluationService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Evaluación actualizada',
          'La evaluación ha sido actualizada exitosamente.'
        );
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar la evaluación',
          err.message
        );
        this.isLoadingSubmit.set(false);
        console.error('Error updating evaluation:', err);
      },
      complete: () => {
        this.isLoadingSubmit.set(false);
        this.router.navigate(['/evaluations']);
      },
    });
  }
}
