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
import { DashboardAdminChartsComponent } from '../charts/dashboard-admin-charts/dashboard-admin-charts.component';

@Component({
  selector: 'app-dashboard-admin',
  imports: [
    SpinnerComponent,
    DashboardQuickActionsComponent,
    DashboardCardComponent,
    DashboardAdminChartsComponent,
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
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
export class DashboardAdminComponent {
  private dashboardService = inject(DashboardService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardAdmin(),
  });

  data = computed(() => this.resourceDashboard.value());

  actions = signal<ActionDashboard[]>([
    {
      title: 'Registrar Usuario',
      icon: 'lucideUserPlus',
      route: '/users/create',
    },
    {
      title: 'Crear Formulario',
      icon: 'lucideTextCursorInput',
      route: '/survey-forms/create',
    },
    {
      title: 'Crear Campaña',
      icon: 'lucideMegaphone',
      route: '/campaigns/create',
    },
    {
      title: 'Asignar Areas de trabajo',
      icon: 'lucideMapPin',
      route: '/work-areas/create',
    },
  ]);
}
