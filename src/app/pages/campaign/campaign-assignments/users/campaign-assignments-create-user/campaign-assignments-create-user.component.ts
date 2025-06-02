import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { CampaignAssignmentUserCreate } from '@interfaces/campaign-assigment-user';
import { CampaignAssignmentsUserService } from '@services/campaign-assignments-user.service';
import { ShareToasterService } from '@services/toast.service';
import { CampaignAssignmentsUserFormComponent } from '../components/campaign-assignments-user-form/campaign-assignments-user-form.component';

@Component({
  selector: 'app-campaign-assignments-create-user',
  imports: [PageHeaderComponent, CampaignAssignmentsUserFormComponent],
  templateUrl: './campaign-assignments-create-user.component.html',
  styleUrl: './campaign-assignments-create-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignAssignmentsCreateUserComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignAssignmentsUserService = inject(
    CampaignAssignmentsUserService
  );

  createAssignment(data: CampaignAssignmentUserCreate) {
    this.campaignAssignmentsUserService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Asignación creada',
          'La asignación ha sido creada exitosamente.'
        );
        this.router.navigate(['/campaigns/assigns/by-user']);
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
