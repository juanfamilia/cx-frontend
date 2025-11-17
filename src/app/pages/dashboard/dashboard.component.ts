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
// import { OnboardingService } from '@services/onboarding.service'; // Temporalmente deshabilitado
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
  // private onboardingService = inject(OnboardingService); // Temporalmente deshabilitado

  currentUser = signal<UserClass>(
    new UserClass(this.authService.getCurrentUser())
  );
  loading = signal(false);

  ngOnInit(): void {
    // Onboarding temporalmente deshabilitado debido a problemas de compilación
    // TODO: Reactivar después de resolver problemas con Shepherd.js
    /*
    if (!this.onboardingService.hasCompletedOnboarding()) {
      setTimeout(() => {
        const userRole = this.currentUser().role;
        this.onboardingService.startOnboarding(userRole);
      }, 1000);
    }
    */
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
