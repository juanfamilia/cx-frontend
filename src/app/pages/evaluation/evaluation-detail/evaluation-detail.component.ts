import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { Evaluation } from '@interfaces/evaluation';
import { EvaluationService } from '@services/evaluation.service';
import { ShareToasterService } from '@services/toast.service';
import { EvaluationAnalysisComponent } from '../components/evaluation-analysis/evaluation-analysis.component';
import { EvaluationFormComponent } from '../components/evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation-detail',
  imports: [
    EvaluationFormComponent,
    SpinnerComponent,
    EvaluationAnalysisComponent,
  ],
  templateUrl: './evaluation-detail.component.html',
  styleUrl: './evaluation-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private evaluationService = inject(EvaluationService);

  id = signal<number>(0);
  evaluation = signal<Evaluation | null>(null);

  isLoading = signal<boolean>(false);

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
}
