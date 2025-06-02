import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { CampaignAssignmentZoneCreate } from '@interfaces/campaign-assignment-zone';
import { CampaignAssignmentsZoneService } from '@services/campaign-assignments-zone.service';
import { ShareToasterService } from '@services/toast.service';
import { CampaignAssignmentsZoneFormComponent } from '../components/campaign-assignments-zone-form/campaign-assignments-zone-form.component';

@Component({
  selector: 'app-campaign-assignments-create-zone',
  imports: [PageHeaderComponent, CampaignAssignmentsZoneFormComponent],
  templateUrl: './campaign-assignments-create-zone.component.html',
  styleUrl: './campaign-assignments-create-zone.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignAssignmentsCreateZoneComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignAssignmentsZoneService = inject(
    CampaignAssignmentsZoneService
  );

  createAssignment(data: CampaignAssignmentZoneCreate) {
    this.campaignAssignmentsZoneService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Asignación creada',
          'La asignación ha sido creada exitosamente.'
        );
        this.router.navigate(['/campaigns/assigns/by-zones']);
      },
      error: error => {
        this.toastService.showToast(
          'error',
          'Error al crear la asignación',
          error.message
        );
        console.error('Error creating campaign assignment:', error);
      },
    });
  }
}
