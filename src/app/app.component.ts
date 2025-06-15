import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMobileComponent } from '@components/navigation/nav-mobile/nav-mobile.component';
import { SidebarComponent } from '@components/navigation/sidebar/sidebar.component';
import { ToggleSidebarComponent } from '@components/navigation/toggle-sidebar/toggle-sidebar.component';
import { provideIcons } from '@ng-icons/core';
import { heroHome } from '@ng-icons/heroicons/outline';
import { AuthService } from '@services/auth.service';
import { ThemeServiceService } from '@services/theme-service.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SidebarComponent,
    NgClass,
    ToastModule,
    ToggleSidebarComponent,
    NavMobileComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroHome })],
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeServiceService);
  authService = inject(AuthService);

  isMobile = signal<boolean>(false);

  loggedIn = computed(() => this.authService.loggedIn());

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const newWidth = (event.target as Window).innerWidth;
    this.checkWindowSize(newWidth);
  }

  checkWindowSize(width: number) {
    this.isMobile.set(width <= 1024);
  }

  ngOnInit() {
    this.checkWindowSize(window.innerWidth);
  }
}
