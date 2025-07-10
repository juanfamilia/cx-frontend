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
import { Campaign, CampaignCreate } from '@interfaces/campaign';
import { CampaignService } from '@services/campaign.service';
import { ShareToasterService } from '@services/toast.service';
import { CampaignFormComponent } from '../components/campaign-form/campaign-form.component';

@Component({
  selector: 'app-campaign-update',
  imports: [PageHeaderComponent, CampaignFormComponent, SpinnerComponent],
  templateUrl: './campaign-update.component.html',
  styleUrl: './campaign-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignUpdateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ShareToasterService);
  private campaignService = inject(CampaignService);

  id = signal<number>(0);
  campaign = signal<Campaign | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.campaignService.getOne(this.id()).subscribe({
        next: data => {
          this.campaign.set(data);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener la campaña',
            err.message
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updateCampaign(data: CampaignCreate) {
    this.campaignService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Campaña actualizada',
          'La campaña ha sido actualizada exitosamente.'
        );
        this.router.navigate(['/campaigns']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar la campaña',
          err.message
        );
        console.error('Error updating campaign:', err);
      },
    });
  }
}
