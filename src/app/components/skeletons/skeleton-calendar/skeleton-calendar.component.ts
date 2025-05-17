import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-calendar',
  imports: [SkeletonModule],
  templateUrl: './skeleton-calendar.component.html',
  styleUrl: './skeleton-calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCalendarComponent {}
