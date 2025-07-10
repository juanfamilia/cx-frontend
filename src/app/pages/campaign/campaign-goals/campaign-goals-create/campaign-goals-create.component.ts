import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { CampaignGoalsEvaluatorCreate } from '@interfaces/campaign-goals-evaluator';
import { CampaignGoalsEvaluatorService } from '@services/campaign-goals-evaluator.service';
import { ShareToasterService } from '@services/toast.service';
import { CampaignGoalsFormComponent } from '../components/campaign-goals-form/campaign-goals-form.component';

@Component({
  selector: 'app-campaign-goals-create',
  imports: [PageHeaderComponent, CampaignGoalsFormComponent],
  templateUrl: './campaign-goals-create.component.html',
  styleUrl: './campaign-goals-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignGoalsCreateComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignGoalsService = inject(CampaignGoalsEvaluatorService);

  createGoal(data: CampaignGoalsEvaluatorCreate) {
    this.campaignGoalsService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Meta creada',
          'La meta ha sido creada exitosamente.'
        );
        this.router.navigate(['/campaigns/goals']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al crear la meta',
          err.message
        );
        console.error('Error creating goal:', err);
      },
    });
  }
}
