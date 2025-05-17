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
import { lucideHouse } from '@ng-icons/lucide';
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
      roles: [0, 1],
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
