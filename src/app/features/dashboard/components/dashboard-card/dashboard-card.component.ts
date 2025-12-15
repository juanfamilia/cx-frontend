import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard-card',
  imports: [NgIcon, NgClass],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>();
  iconColor = input<string>();
}
