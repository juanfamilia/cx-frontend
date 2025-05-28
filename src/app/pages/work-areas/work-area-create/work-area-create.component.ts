import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { ShareToasterService } from '@services/toast.service';
import { UserZoneService } from '@services/user-zone.service';
import { WorkAreaFormComponent } from '../components/work-area-form/work-area-form.component';

@Component({
  selector: 'app-work-area-create',
  imports: [WorkAreaFormComponent, PageHeaderComponent],
  templateUrl: './work-area-create.component.html',
  styleUrl: './work-area-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkAreaCreateComponent {
  private router = inject(Router);
  private userZoneService = inject(UserZoneService);
  private toastService = inject(ShareToasterService);

  createWorkArea(data: { user_id: number; zone_ids: number[] }) {
    this.userZoneService.create(data).subscribe({
      next: () => {
        this.router.navigate(['/work-areas']);
        this.toastService.showToast(
          'success',
          'Area de Trabajo creada',
          'La area de trabajo ha sido creada exitosamente.'
        );
      },
      error: error => {
        console.error('Error creating work area:', error);
        this.toastService.showToast(
          'error',
          'Error al crear la area de trabajo',
          error.message
        );
      },
    });
  }
}
