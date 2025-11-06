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
import { CampaignGoalsProgressService } from '@services/campaign-goals-progress.service';
import { DashboardService } from '@services/dashboard.service';
import { ProgressBar } from 'primeng/progressbar';
import { ActionDashboard } from 'src/app/types/actionsDashboard';
import { DashboardEvaluatorsChartsComponent } from '../charts/dashboard-evaluators-charts/dashboard-evaluators-charts.component';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { DashboardQuickActionsComponent } from '../dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
  selector: 'app-dashboard-evaluators',
  imports: [
    SpinnerComponent,
    DashboardCardComponent,
    DashboardQuickActionsComponent,
    ProgressBar,
    DashboardEvaluatorsChartsComponent,
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
  private campaignGoalsProgressService = inject(CampaignGoalsProgressService);

  resourceDashboard = rxResource({
    loader: () => this.dashboardService.getDashboardEvaluator(),
  });

  resourceGoalsProgress = rxResource({
    loader: () => this.campaignGoalsProgressService.getByEvaluator(),
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
