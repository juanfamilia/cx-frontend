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
  lucideCircleAlert,
  lucideCircleCheckBig,
  lucideCircleX,
  lucidePencil,
  lucidePlus,
  lucideSend,
} from '@ng-icons/lucide';
import { DashboardService } from '@services/dashboard.service';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
  selector: 'app-dashboard-evaluators',
  imports: [
    SpinnerComponent,
    DashboardCardComponent,
    DashboardQuickActionsComponent,
  ],
  templateUrl: './dashboard-evaluators.component.html',
  styleUrl: './dashboard-evaluators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideSend,
      lucideCircleCheckBig,
      lucideCircleAlert,
      lucidePencil,
      lucideCircleX,
      lucidePlus,
    }),
  ],
})
export class DashboardEvaluatorsComponent {
  private dashboardService = inject(DashboardService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardEvaluator(),
  });

  data = computed(() => this.resourceDashboard.value());

  actions = signal<ActionDashboard[]>([
    {
      title: 'Registrar Evaluación',
      icon: 'lucidePlus',
      route: '/evaluations/create',
    },
  ]);
}
