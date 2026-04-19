import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideLayers,
  lucideMoon,
  lucideSunMedium,
} from '@ng-icons/lucide';
import { ThemeServiceService } from '@services/theme-service.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-configuration-dashboard',
  imports: [
    PageHeaderComponent,
    NgIcon,
    NgClass,
    ToggleSwitchModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './configuration-dashboard.component.html',
  styleUrl: './configuration-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideSunMedium, lucideMoon, lucideLayers, lucideArrowRight }),
  ],
})
export class ConfigurationDashboardComponent {
  private themeService = inject(ThemeServiceService);
  private auth = inject(AuthService);

  companyAdmin = computed(() => this.auth.getCurrentUser()?.role === 1);

  darkMode = computed(() => this.themeService.darkMode());

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
