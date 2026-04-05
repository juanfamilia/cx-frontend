import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ActionDashboard } from 'src/app/types/actionsDashboard';

@Component({
  selector: 'app-dashboard-quick-actions',
  imports: [NgIcon],
  templateUrl: './dashboard-quick-actions.component.html',
  styleUrl: './dashboard-quick-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardQuickActionsComponent {
  actions = input.required<ActionDashboard[]>();
  /** Título de la tarjeta (ajustar por intención del rol). */
  heading = input<string>('Acciones rápidas');
  /** Una línea bajo el título (opcional). */
  description = input<string>();

  private router = inject(Router);

  goTo(route: string) {
    const path = route.trim();
    if (path.startsWith('/')) {
      void this.router.navigateByUrl(path);
    } else {
      void this.router.navigate([path]);
    }
  }
}
