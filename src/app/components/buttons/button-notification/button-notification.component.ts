import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell } from '@ng-icons/lucide';
import { NotificationService } from '@services/notification.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-button-notification',
  imports: [OverlayBadgeModule, NgIcon],
  templateUrl: './button-notification.component.html',
  styleUrl: './button-notification.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideBell })],
})
export class ButtonNotificationComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  count = signal<number>(0);

  ngOnInit() {
    this.notificationService.getCount().subscribe({
      next: count => this.count.set(count),
    });
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }
}
