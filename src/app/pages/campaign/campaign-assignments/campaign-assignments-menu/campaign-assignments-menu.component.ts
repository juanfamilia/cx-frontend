import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideMap, lucideUser } from '@ng-icons/lucide';

@Component({
  selector: 'app-campaign-assignments-menu',
  imports: [
    PageHeaderComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './campaign-assignments-menu.component.html',
  styleUrl: './campaign-assignments-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideUser, lucideMap, lucideArrowLeft })],
})
export class CampaignAssignmentsMenuComponent {
  private router = inject(Router);

  AssignsByUser() {
    this.router.navigate(['/campaigns/assigns/by-user']);
  }

  AssignsByZones() {
    this.router.navigate(['/campaigns/assigns/by-zones']);
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }
}
