import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-skeleton-dashboard',
  imports: [SkeletonModule, SkeletonCardComponent],
  templateUrl: './skeleton-dashboard.component.html',
  styleUrl: './skeleton-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDashboardComponent {}
