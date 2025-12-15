import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { Router } from '@angular/router';
import {
  CampaignGoalsEvaluatorCreate,
} from '@interfaces/campaign-goals-evaluator';
import { CampaignGoalsEvaluatorService } from '@pages/dashboard/campaign-goals-evaluator.service';
import { ShareToasterService } from '@core/services/toast.service';
import { CampaignGoalsFormComponent } from '../components/campaign-goals-form/campaign-goals-form.component';

@Component({
  selector: 'app-campaign-goals-create',
  standalone: true,
  imports: [
    CampaignGoalsFormComponent,
    PageHeaderComponent,  // ← FALTABA
  ],
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
      error: (err: any) => {
        console.error(err);
        this.toastService.showToast(
          'error',
          'Error al crear la meta',
          'Ocurrió un error al crear la meta'
        );
      },
    });
  }
}
