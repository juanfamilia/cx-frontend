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
  lucideChartArea,
  lucideCircleCheckBig,
  lucideCircleX,
  lucideMapPin,
  lucideMegaphone,
  lucideTextCursorInput,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { DashboardService } from '@pages/dashboard/dashboard.service';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';
import { DashboardAdminChartsComponent } from '../charts/dashboard-admin-charts/dashboard-admin-charts.component';

@Component({
  selector: 'app-dashboard-admin',
  imports: [
    SpinnerComponent,
    RouterLink,
    DashboardQuickActionsComponent,
    DashboardCardComponent,
    DashboardAdminChartsComponent,
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideChartArea,
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
export class DashboardAdminComponent {
  private dashboardService = inject(DashboardService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardAdmin(),
  });

  data = computed(() => this.resourceDashboard.value());

  actions = signal<ActionDashboard[]>([
    {
      title: 'Abrir resumen ejecutivo CX',
      icon: 'lucideChartArea',
      route: '/executive-dashboard',
      variant: 'primary',
    },
    {
      title: 'Registrar usuario',
      icon: 'lucideUserPlus',
      route: '/users/create',
    },
    {
      title: 'Crear formulario',
      icon: 'lucideTextCursorInput',
      route: '/survey-forms/create',
    },
    {
      title: 'Crear campaña',
      icon: 'lucideMegaphone',
      route: '/campaigns/create',
    },
    {
      title: 'Nueva área de trabajo',
      icon: 'lucideMapPin',
      route: '/work-areas/create',
    },
  ]);
}
