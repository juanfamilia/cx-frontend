import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ButtonNotificationComponent } from '@components/buttons/button-notification/button-notification.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { UserClass } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideClipboardPlus,
  lucideClock,
  lucideUsers,
} from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';
import { OnboardingService, OnboardingStep } from '@services/onboarding.service';
import { OnboardingTourComponent } from '@components/onboarding-tour/onboarding-tour.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { DashboardEvaluatorsComponent } from './components/dashboard-evaluators/dashboard-evaluators.component';
import { DashboardManagerComponent } from './components/dashboard-manager/dashboard-manager.component';
import { DashboardSuperadminComponent } from './components/dashboard-superadmin/dashboard-superadmin.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    PageHeaderComponent,
    ButtonNotificationComponent,
    DashboardEvaluatorsComponent,
    DashboardAdminComponent,
    DashboardManagerComponent,
    DashboardSuperadminComponent,
    OnboardingTourComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideUsers,
      lucideClock,
      lucideCalendar,
      lucideClipboardPlus,
    }),
  ],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private onboardingService = inject(OnboardingService);

  currentUser = signal<UserClass>(
    new UserClass(this.authService.getCurrentUser())
  );
  loading = signal(false);
  
  // Onboarding state
  showOnboarding = signal(false);
  onboardingSteps = signal<OnboardingStep[]>([]);

  ngOnInit(): void {
    // Check if user needs onboarding
    if (!this.onboardingService.hasCompletedOnboarding()) {
      setTimeout(() => {
        const userRole = this.currentUser().role;
        this.onboardingSteps.set(this.onboardingService.getStepsForRole(userRole));
        this.showOnboarding.set(true);
      }, 800);
    }
  }
  
  onOnboardingComplete(): void {
    this.onboardingService.markAsCompleted();
    this.showOnboarding.set(false);
  }
  
  onOnboardingSkip(): void {
    this.onboardingService.markAsCompleted();
    this.showOnboarding.set(false);
  }

  getDescription(): string {
    switch (this.currentUser().role) {
      case 0:
        return 'Gestiona la aplicación, tus empresas y pagos';

      case 1:
        return 'Gestiona tus campañas, trabajadores y evaluaciones';

      case 2:
        return 'Dashboard Gerente';

      case 3:
        return 'Aquí tienes un resumen de las actividades recientes';

      default:
        return 'Dashboard';
    }
  }
}
