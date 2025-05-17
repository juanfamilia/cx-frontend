import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRight } from '@ng-icons/heroicons/outline';
import { lucideMenu, lucideX } from '@ng-icons/lucide';
import { SidebarService } from '@services/sidebar.service';

@Component({
  selector: 'app-toggle-sidebar',
  imports: [NgIcon],
  templateUrl: './toggle-sidebar.component.html',
  styleUrl: './toggle-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      heroChevronRight,
      lucideMenu,
      lucideX,
    }),
  ],
})
export class ToggleSidebarComponent {
  private sidebarService = inject(SidebarService);

  isCollapsed = computed(() => this.sidebarService.isCollapsed());

  toggle() {
    this.sidebarService.toggleSidebar();
  }
}
