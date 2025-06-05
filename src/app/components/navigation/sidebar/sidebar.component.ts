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
  lucideBriefcaseBusiness,
  lucideFileText,
  lucideHouse,
  lucideMapPinned,
  lucideMegaphone,
  lucideTextCursorInput,
} from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';
import { SidebarService } from '@services/sidebar.service';
import { RouteData } from 'src/app/types/routeData';
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
    }),
  ],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private sidebarService = inject(SidebarService);

  isCollapsed = computed(() => this.sidebarService.isCollapsed());
  currentUser = signal<User>(this.authService.getCurrentUser());

  routes: RouteData[] = [
    {
      title: 'Dashboard',
      route: '/',
      icon: 'lucideHouse',
      roles: [0, 1, 2, 3],
    },
    {
      title: 'Usuarios',
      route: '/users',
      icon: 'heroUsers',
      roles: [0, 1, 2],
    },
    {
      title: 'Empresas',
      route: '/companies',
      icon: 'lucideBriefcaseBusiness',
      roles: [0],
    },
    {
      title: 'Pagos',
      route: '/payments',
      icon: 'lucideBanknote',
      roles: [0],
    },
    {
      title: 'Areas',
      route: '/work-areas',
      icon: 'lucideMapPinned',
      roles: [1],
    },
    {
      title: 'Formularios',
      route: '/survey-forms',
      icon: 'lucideTextCursorInput',
      roles: [1],
    },
    {
      title: 'Campañas',
      route: '/campaigns',
      icon: 'lucideMegaphone',
      roles: [1, 2],
    },
    {
      title: 'Evaluaciones',
      route: '/evaluations',
      icon: 'lucideFileText',
      roles: [1, 2, 3],
    },
    {
      title: 'Configuración',
      route: '/configuration',
      icon: 'heroCog6Tooth',
      roles: [0, 1, 2, 3],
    },
  ];

  logout() {
    this.authService.logout();
  }
}
