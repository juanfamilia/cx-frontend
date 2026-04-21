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
  lucideChartLine,
  lucideBrain,
  lucideBriefcaseBusiness,
  lucideFileText,
  lucideFlaskConical,
  lucideFolderKanban,
  lucideHouse,
  lucideMapPinned,
  lucideMegaphone,
  lucideSearch,
  lucideSparkles,
  lucideTextCursorInput,
} from '@ng-icons/lucide';
import { AuthService } from '@core/services/auth.service';
import { EntitlementsService } from '@core/services/entitlements.service';
import { InsAccessService } from '@core/services/ins-access.service';
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
      lucideFlaskConical,
      lucideFolderKanban,
      lucideChartLine,
    }),
  ],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private entitlements = inject(EntitlementsService);
  private insAccess = inject(InsAccessService);
  private sidebarService = inject(SidebarService);
  private themeService = inject(ThemeServiceService);

  constructor() {
    this.insAccess.ensureLoaded().subscribe();
    this.entitlements.ensureLoaded().subscribe();
  }

  isCollapsed = computed(() => this.sidebarService.isCollapsed());
  currentUser = signal<User>(this.authService.getCurrentUser());

  darkMode = computed(() => this.themeService.darkMode());

  visibleRoutes = computed(() => {
    const u = this.currentUser();
    this.insAccess.loaded();
    this.insAccess.access();
    this.entitlements.loaded();
    this.entitlements.me();
    return NAVROUTES.filter(
      r =>
        r.roles.includes(u.role) &&
        (!r.requiresIns || this.insAccess.canShowInsNavLink(u)) &&
        (!r.requiresField || this.entitlements.canShowFieldNavLink(u)) &&
        (!r.requiresClever || this.entitlements.canShowCleverNavLink(u))
    );
  });

  logout() {
    this.authService.logout();
  }
}
