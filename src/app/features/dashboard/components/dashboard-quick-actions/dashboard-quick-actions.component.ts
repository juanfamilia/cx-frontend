import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ActionDashboard } from 'src/app/types/actionsDashboard';

@Component({
  selector: 'app-dashboard-quick-actions',
  imports: [NgIcon],
  templateUrl: './dashboard-quick-actions.component.html',
  styleUrl: './dashboard-quick-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardQuickActionsComponent {
  actions = input.required<ActionDashboard[]>();

  private router = inject(Router);

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
