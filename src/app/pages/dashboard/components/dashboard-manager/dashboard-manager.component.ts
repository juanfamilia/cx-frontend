import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheckBig,
  lucideCircleX,
  lucideMapPin,
  lucideMegaphone,
  lucideTextCursorInput,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { DashboardService } from '@services/dashboard.service';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
  selector: 'app-dashboard-manager',
  imports: [
    SpinnerComponent,
    DashboardQuickActionsComponent,
    DashboardCardComponent,
  ],
  templateUrl: './dashboard-manager.component.html',
  styleUrl: './dashboard-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideUserPlus,
      lucideCircleCheckBig,
      lucideCircleX,
      lucideUsers,
      lucideTextCursorInput,
      lucideMegaphone,
      lucideMapPin,
    }),
  ],
})
export class DashboardManagerComponent {
  private dashboardService = inject(DashboardService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardManager(),
  });

  data = computed(() => this.resourceDashboard.value());

  actions = signal<ActionDashboard[]>([
    {
      title: 'Registrar Evaluador',
      icon: 'lucideUserPlus',
      route: '/users/create',
    },
    {
      title: 'Asignar Campaña',
      icon: 'lucideMegaphone',
      route: '/campaigns/assigns',
    },
  ]);
}
