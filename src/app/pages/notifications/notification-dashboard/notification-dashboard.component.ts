import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideCheckCheck, lucideFilter } from '@ng-icons/lucide';
import { NotificationService } from '@services/notification.service';
import { BadgeModule } from 'primeng/badge';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationCardComponent } from '../components/notification-card/notification-card.component';

@Component({
  selector: 'app-notification-dashboard',
  imports: [
    NgIcon,
    NotificationCardComponent,
    SelectButtonModule,
    FormsModule,
    BadgeModule,
  ],
  templateUrl: './notification-dashboard.component.html',
  styleUrl: './notification-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideBell, lucideFilter, lucideCheckCheck })],
})
export class NotificationDashboardComponent {
  private notificationsService = inject(NotificationService);

  stateOptions = [
    { label: 'Todas', value: 'all', icon: 'lucideFilter' },
    { label: 'Pendientes', value: 'pending', icon: 'lucideBell' },
    { label: 'Atendidas', value: 'read', icon: 'lucideCheckCheck' },
  ];

  value = signal<string>('all');

  notificationsResource = rxResource({
    loader: () => this.notificationsService.getAll(),
  });

  notifications = computed(() => {
    switch (this.value()) {
      case 'all':
        return this.notificationsResource.value()!;

      case 'pending':
        return this.notificationsResource
          .value()!
          .filter(notification => !notification.read);

      case 'read':
        return this.notificationsResource
          .value()!
          .filter(notification => notification.read);

      default:
        return this.notificationsResource.value()!;
    }
  });

  getPendingCount() {
    return this.notificationsResource
      .value()!
      .filter(notification => !notification.read).length;
  }

  getReadCount() {
    return this.notificationsResource
      .value()!
      .filter(notification => notification.read).length;
  }
}
