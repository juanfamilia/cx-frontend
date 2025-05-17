import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSunMedium } from '@ng-icons/lucide';
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
  ],
  templateUrl: './configuration-dashboard.component.html',
  styleUrl: './configuration-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideSunMedium, lucideMoon })],
})
export class ConfigurationDashboardComponent {
  private themeService = inject(ThemeServiceService);

  darkMode = computed(() => this.themeService.darkMode());

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
