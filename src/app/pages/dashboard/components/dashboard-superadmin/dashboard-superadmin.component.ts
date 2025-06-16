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
  lucideBanknote,
  lucideBriefcaseBusiness,
  lucideBuilding2,
  lucideCircleX,
  lucideDollarSign,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { DashboardService } from '@services/dashboard.service';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
  selector: 'app-dashboard-superadmin',
  imports: [
    SpinnerComponent,
    DashboardQuickActionsComponent,
    DashboardCardComponent,
  ],
  templateUrl: './dashboard-superadmin.component.html',
  styleUrl: './dashboard-superadmin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideUserPlus,
      lucideBriefcaseBusiness,
      lucideDollarSign,
      lucideBuilding2,
      lucideBanknote,
      lucideCircleX,
      lucideUsers,
    }),
  ],
})
export class DashboardSuperadminComponent {
  private dashboardService = inject(DashboardService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardSuperAdmin(),
  });

  data = computed(() => this.resourceDashboard.value());

  actions = signal<ActionDashboard[]>([
    {
      title: 'Registrar Usuario',
      icon: 'lucideUserPlus',
      route: '/users/create',
    },
    {
      title: 'Registrar Empresa',
      icon: 'lucideBriefcaseBusiness',
      route: '/companies/create',
    },
    {
      title: 'Registrar Pago',
      icon: 'lucideDollarSign',
      route: '/payments/create',
    },
  ]);
}
