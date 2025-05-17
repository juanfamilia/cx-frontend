import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { User } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideClipboardPlus,
  lucideClock,
  lucideUsers,
} from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideUsers,
      lucideClock,
      lucideCalendar,
      lucideClipboardPlus,
    }),
  ],
})
export class DashboardComponent {
  private authService = inject(AuthService);

  currentUser = signal<User>(this.authService.getCurrentUser());
  loading = signal(false);
}
