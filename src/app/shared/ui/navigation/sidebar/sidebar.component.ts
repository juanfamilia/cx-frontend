import { NgClass } from '@angular/common';
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
  lucideChartArea,
  lucideBrain,
  lucideBriefcaseBusiness,
  lucideFileText,
  lucideHouse,
  lucideMapPinned,
  lucideMegaphone,
  lucideSearch,
  lucideSparkles,
  lucideTextCursorInput,
} from '@ng-icons/lucide';
import { AuthService } from '@core/services/auth.service';
import { SidebarService } from '@core/services/sidebar.service';
import { ThemeServiceService } from '@shared/services/theme-service.service';
import { NAVROUTES } from '@shared/constants/navRoutes.constant';
import { NavLinkComponent } from '../nav-link/nav-link.component';

@Component({
  selector: 'app-sidebar',
  imports: [NavLinkComponent, NgIcon, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
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
    }),
  ],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private sidebarService = inject(SidebarService);
  private themeService = inject(ThemeServiceService);

  isCollapsed = computed(() => this.sidebarService.isCollapsed());
  currentUser = signal<User>(this.authService.getCurrentUser());

  darkMode = computed(() => this.themeService.darkMode());

  routes = NAVROUTES;

  logout() {
    this.authService.logout();
  }
}
