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
import {
  CampaignGoalsEvaluator,
  CampaignGoalsEvaluatorCreate,
  CampaignGoalsEvaluatorUpdate,
} from '@interfaces/campaign-goals-evaluator';
import { CampaignGoalsEvaluatorService } from '@services/campaign-goals-evaluator.service';
import { ShareToasterService } from '@services/toast.service';
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
        next: data => {
          this.goal.set(data);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener la meta',
            err.message
          );
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
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar la meta',
          err.error.detail
        );
        console.error('Error updating goal:', err);
      },
    });
  }
}
