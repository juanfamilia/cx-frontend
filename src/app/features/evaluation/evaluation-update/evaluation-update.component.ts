import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, finalize, map, switchMap, tap } from 'rxjs';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';
import { Evaluation } from '@interfaces/evaluation';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ShareToasterService } from '@core/services/toast.service';
import { EvaluationFormComponent } from '../components/evaluation-form/evaluation-form.component';

interface ReviewerFeedback {
  type: 'rejected' | 'edit';
  title: string;
  comment: string | null;
  tags: string[];
}

@Component({
  selector: 'app-evaluation-update',
  imports: [PageHeaderComponent, EvaluationFormComponent, SpinnerComponent],
  templateUrl: './evaluation-update.component.html',
  styleUrl: './evaluation-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationUpdateComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private evaluationService = inject(EvaluationService);

  id = signal<number>(0);
  evaluation = signal<Evaluation | null>(null);
  isLoading = signal<boolean>(false);
  isLoadingSubmit = signal<boolean>(false);

  reviewerFeedback = computed<ReviewerFeedback | null>(() => {
    const ev = this.evaluation();
    if (!ev) return null;
    const hasComment = !!ev.status_comment;
    if (ev.status === 'rechazado') {
      const tags: string[] = [];
      if (ev.rejection_type === 'descartado') tags.push('Descartado definitivamente');
      if (ev.rejection_type === 'discrepancia') tags.push('Discrepancia — revisión pendiente');
      if (ev.requires_revisit) tags.push('Requiere revisita');
      if (!hasComment && tags.length === 0) return null;
      return {
        type: 'rejected',
        title: 'Esta evaluación fue rechazada por el revisor',
        comment: ev.status_comment,
        tags,
      };
    }
    if (ev.status === 'editar') {
      if (!hasComment) return null;
      return {
        type: 'edit',
        title: 'El revisor solicitó correcciones',
        comment: ev.status_comment,
        tags: [],
      };
    }
    return null;
  });

  constructor() {
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
            err.error?.message ?? err.message ?? 'Error desconocido'
          );
        },
      });
  }

  updateEvaluation(data: FormData) {
    this.isLoadingSubmit.set(true);
    this.evaluationService
      .update(data, this.id())
      .pipe(finalize(() => this.isLoadingSubmit.set(false)))
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'success',
            'Evaluación actualizada',
            'La evaluación ha sido actualizada exitosamente.'
          );
          void this.router.navigate(['/evaluations']);
        },
        error: (err: HttpErrorResponse) => {
          this.toastService.showToast(
            'error',
            'Error al actualizar la evaluación',
            err.error?.message ?? err.message ?? 'Error desconocido'
          );
          console.error('Error updating evaluation:', err);
        },
      });
  }
}
