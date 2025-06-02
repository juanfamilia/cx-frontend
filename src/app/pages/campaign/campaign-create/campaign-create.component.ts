import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { CampaignCreate } from '@interfaces/campaign';
import { CampaignService } from '@services/campaign.service';
import { ShareToasterService } from '@services/toast.service';
import { CampaignFormComponent } from '../components/campaign-form/campaign-form.component';

@Component({
  selector: 'app-campaign-create',
  imports: [PageHeaderComponent, CampaignFormComponent],
  templateUrl: './campaign-create.component.html',
  styleUrl: './campaign-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignCreateComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignService = inject(CampaignService);

  createCampaign(data: CampaignCreate) {
    this.campaignService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Campaña creada',
          'La campaña ha sido creada exitosamente.'
        );
        this.router.navigate(['/campaigns']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al crear la campaña',
          err.message
        );
        console.error('Error creating campaign:', err);
      },
    });
  }
}
