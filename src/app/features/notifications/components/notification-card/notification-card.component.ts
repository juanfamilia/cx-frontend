import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { Notification } from '@interfaces/notification';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCheck,
  lucideFileText,
  lucideText,
  lucideUser,
} from '@ng-icons/lucide';
import { NotificationService } from '@pages/notifications/notification.service';
import { ShareToasterService } from '@core/services/toast.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-notification-card',
  imports: [TagModule, ButtonSecondaryComponent, NgIcon, DatePipe, NgClass],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideCheck,
      lucideCalendar,
      lucideFileText,
      lucideUser,
      lucideText,
    }),
  ],
})
export class NotificationCardComponent {
  notification = input.required<Notification>();

  private toastService = inject(ShareToasterService);
  private notificationService = inject(NotificationService);

  loading = signal<boolean>(false);

  markAsRead() {
    this.loading.set(true);
    this.notificationService.markAsRead(this.notification().id).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Notificación marcada como leída',
          'La notificación ha sido marcada como leída.'
        );
      },
      error: error => {
        this.loading.set(false);
        console.error('Error marking notification as read:', error);
      },
      complete: () => {
        this.notification().read = true;
        this.loading.set(false);
      },
    });
  }

  getStatus(): {
    title: string;
    tag: string;
    severity:
      | 'success'
      | 'secondary'
      | 'info'
      | 'warn'
      | 'danger'
      | 'contrast'
      | undefined;
  } {
    switch (this.notification().status) {
      case 'enviado':
        return {
          title: 'Enviada',
          tag: '📥 Enviado',
          severity: undefined,
        };
      case 'editar':
        return {
          title: 'Pendiente de edición',
          tag: '✍️ Editar',
          severity: 'warn',
        };
      case 'actualizado':
        return {
          title: 'Actualizada',
          tag: '📝 Actualizado',
          severity: 'info',
        };
      case 'aprobado':
        return {
          title: 'Aprobada',
          tag: '✅ Aprobada',
          severity: 'success',
        };
      case 'rechazado':
        return {
          title: 'Rechazada',
          tag: '❌ Rechazada',
          severity: 'danger',
        };
      default:
        return {
          title: 'Sin estado',
          tag: '❓ Estado desconocido',
          severity: 'secondary',
        };
    }
  }
}
