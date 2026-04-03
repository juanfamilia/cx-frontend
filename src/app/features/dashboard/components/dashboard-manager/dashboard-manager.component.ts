import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheckBig,
  lucideCircleX,
  lucideFileText,
  lucideMapPin,
  lucideMegaphone,
  lucideSearch,
  lucideTarget,
  lucideTextCursorInput,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { DashboardService } from '@pages/dashboard/dashboard.service';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardAdminChartsComponent } from '../charts/dashboard-admin-charts/dashboard-admin-charts.component';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
  selector: 'app-dashboard-manager',
  imports: [
    SpinnerComponent,
    RouterLink,
    DashboardQuickActionsComponent,
    DashboardCardComponent,
    DashboardAdminChartsComponent,
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
      lucideFileText,
      lucideSearch,
      lucideTarget,
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
      title: 'Registrar evaluador',
      icon: 'lucideUserPlus',
      route: '/users/create',
      variant: 'primary',
    },
    {
      title: 'Ver evaluaciones del equipo',
      icon: 'lucideFileText',
      route: '/evaluations',
    },
    {
      title: 'Asignaciones de campaña',
      icon: 'lucideMegaphone',
      route: '/campaigns/assigns',
    },
    {
      title: 'Metas por evaluador',
      icon: 'lucideTarget',
      route: '/campaigns/goals',
    },
    {
      title: 'Buscar en transcripciones',
      icon: 'lucideSearch',
      route: '/transcript-search',
    },
  ]);
}
