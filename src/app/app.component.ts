import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroHome })],
})
export class AppComponent {
  themeService = inject(ThemeServiceService);
  authService = inject(AuthService);

  loggedIn: Signal<boolean> = computed(() => this.authService.loggedIn());
}
