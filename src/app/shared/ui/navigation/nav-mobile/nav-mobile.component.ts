import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { User } from '@interfaces/user';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroCog6Tooth,
  heroUsers,
} from '@ng-icons/heroicons/outline';
import {
  lucideBanknote,
  lucideBrain,
  lucideBriefcaseBusiness,
  lucideChartArea,
  lucideFileText,
  lucideFlaskConical,
  lucideHouse,
  lucideMapPinned,
  lucideMegaphone,
  lucideSearch,
  lucideSparkles,
  lucideTextCursorInput,
} from '@ng-icons/lucide';
import { AuthService } from '@core/services/auth.service';
import { InsAccessService } from '@core/services/ins-access.service';
import { NAVROUTES } from '@shared/constants/navRoutes.constant';
import { NavLinkComponent } from '../nav-link/nav-link.component';

@Component({
  selector: 'app-nav-mobile',
  imports: [NavLinkComponent, NgIcon],
  templateUrl: './nav-mobile.component.html',
  styleUrl: './nav-mobile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideHouse,
      heroUsers,
      heroCog6Tooth,
      heroArrowRightOnRectangle,
      lucideBriefcaseBusiness,
      lucideBanknote,
      lucideMapPinned,
      lucideTextCursorInput,
      lucideMegaphone,
      lucideFileText,
      lucideSparkles,
      lucideBrain,
      lucideChartArea,
      lucideSearch,
      lucideFlaskConical,
    }),
  ],
})
export class NavMobileComponent {
  private authService = inject(AuthService);
  private insAccess = inject(InsAccessService);

  constructor() {
    this.insAccess.ensureLoaded().subscribe();
  }

  currentUser = signal<User>(this.authService.getCurrentUser());

  visibleRoutes = computed(() => {
    const u = this.currentUser();
    this.insAccess.loaded();
    this.insAccess.access();
    return NAVROUTES.filter(
      r =>
        r.roles.includes(u.role) &&
        (!r.requiresIns || this.insAccess.canShowInsNavLink(u))
    );
  });

  logout() {
    this.authService.logout();
  }
}
