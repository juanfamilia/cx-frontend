import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignAssignmentsUserService } from '@pages/campaign/campaign-assignments-user.service';
import { ShareToasterService } from '@core/services/toast.service';
import { CampaignAssignmentUserCreate } from '@interfaces/campaign-assigment-user';
import { CampaignAssignmentsUserFormComponent } from '../components/campaign-assignments-user-form/campaign-assignments-user-form.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-campaign-assignments-create-user',
  standalone: true,
  imports: [
    CampaignAssignmentsUserFormComponent,
    PageHeaderComponent     // ← FALTABA ESTO
  ],
  templateUrl: './campaign-assignments-create-user.component.html',
  styleUrl: './campaign-assignments-create-user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignAssignmentsCreateUserComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignAssignmentsUserService = inject(CampaignAssignmentsUserService);

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
      error: (error: unknown) => {
        console.error(error);
        this.toastService.showToast(
          'error',
          'Error al crear la asignación',
          'Ocurrió un error al crear la asignación'
        );
      },
    });
  }
}
