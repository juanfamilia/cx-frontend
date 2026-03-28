import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, finalize, map, switchMap, tap } from 'rxjs';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';
import { Evaluation } from '@interfaces/evaluation';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ShareToasterService } from '@core/services/toast.service';
import { EvaluationAnalysisComponent } from '../components/evaluation-analysis/evaluation-analysis.component';
import { EvaluationFormComponent } from '../components/evaluation-form/evaluation-form.component';
import { InteractionPlayerComponent } from '../components/interaction-player/interaction-player.component';

@Component({
  selector: 'app-evaluation-detail',
  imports: [
    EvaluationFormComponent,
    SpinnerComponent,
    EvaluationAnalysisComponent,
    InteractionPlayerComponent,
  ],
  templateUrl: './evaluation-detail.component.html',
  styleUrl: './evaluation-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private evaluationService = inject(EvaluationService);

  id = signal<number>(0);
  evaluation = signal<Evaluation | null>(null);
  isLoading = signal<boolean>(false);
  activeTab = signal<'analysis' | 'player'>('analysis');
  seekFromRoute = signal<number | null>(null);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(qp => {
      const tab = qp.get('tab');
      if (tab === 'player') {
        this.activeTab.set('player');
      } else if (tab === 'analysis') {
        this.activeTab.set('analysis');
      }
      const t = qp.get('t');
      if (t != null && Number.isFinite(Number(t))) {
        this.seekFromRoute.set(Number(t));
      } else {
        this.seekFromRoute.set(null);
      }
    });

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(),
        map(p => Number(p.get('id'))),
        filter((id): id is number => Number.isFinite(id) && id > 0),
        tap(id => {
          this.id.set(id);
          this.evaluation.set(null);
          this.isLoading.set(true);
        }),
        switchMap(id =>
          this.evaluationService.getOne(id).pipe(
            finalize(() => this.isLoading.set(false))
          )
        )
      )
      .subscribe({
        next: data => this.evaluation.set(data),
        error: (err: HttpErrorResponse) => {
          this.evaluation.set(null);
          this.toastService.showToast(
            'error',
            'Error al obtener la evaluación',
            this.evaluationErrorMessage(err)
          );
        },
      });
  }

  private evaluationErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
    }
    if (typeof body === 'string' && body.length > 0) {
      return body;
    }
    if (err.status === 404) {
      return 'La evaluación no existe o no tiene permisos para verla.';
    }
    if (err.status === 0) {
      return 'Sin conexión o servidor no disponible';
    }
    return `Error ${err.status}`;
  }

  setTab(tab: 'analysis' | 'player') {
    this.activeTab.set(tab);
  }

  backToList() {
    void this.router.navigate(['/evaluations']);
  }
}
