import {
  ChangeDetectionStrategy,
  Component,
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
  lucideBriefcaseBusiness,
  lucideFileText,
  lucideHouse,
  lucideMapPinned,
  lucideMegaphone,
  lucideTextCursorInput,
} from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';
import { NAVROUTES } from 'src/app/constants/navRoutes.constant';
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
    }),
  ],
})
export class NavMobileComponent {
  private authService = inject(AuthService);

  routes = NAVROUTES;
  currentUser = signal<User>(this.authService.getCurrentUser());

  logout() {
    this.authService.logout();
  }
}
