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
import {
  CampaignGoalsEvaluator,
  CampaignGoalsEvaluatorCreate,
  CampaignGoalsEvaluatorUpdate,
} from '@interfaces/campaign-goals-evaluator';
import { CampaignGoalsEvaluatorService } from '@pages/dashboard/campaign-goals-evaluator.service';
import { ShareToasterService } from '@core/services/toast.service';
import { CampaignGoalsFormComponent } from '../components/campaign-goals-form/campaign-goals-form.component';

@Component({
  selector: 'app-campaign-goals-update',
  imports: [PageHeaderComponent, CampaignGoalsFormComponent, SpinnerComponent],
  templateUrl: './campaign-goals-update.component.html',
  styleUrl: './campaign-goals-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignGoalsUpdateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private campaignGoalsService = inject(CampaignGoalsEvaluatorService);

  id = signal<number>(0);
  goal = signal<CampaignGoalsEvaluator | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.campaignGoalsService.getOne(this.id()).subscribe({
        next: (data: CampaignGoalsEvaluator) => {
          this.goal.set(data);
        },
        error: (err: unknown) => {
          console.error(err);
          this.toastService.showToast(
            'error',
            'Error al obtener la meta',
            'Ocurrió un error al obtener la meta'
          );
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updateGoal(data: CampaignGoalsEvaluatorCreate) {
    const dataUpdate: CampaignGoalsEvaluatorUpdate = {
      goal: data.goal,
    };

    this.campaignGoalsService.update(dataUpdate, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Meta actualizada',
          'La meta ha sido actualizada exitosamente.'
        );
        this.router.navigate(['/campaigns/goals']);
      },
      error: (err: unknown) => {
        console.error('Error updating goal:', err);
        this.toastService.showToast(
          'error',
          'Error al actualizar la meta',
          'Ocurrió un error al actualizar la meta'
        );
      },
    });
  }
}
