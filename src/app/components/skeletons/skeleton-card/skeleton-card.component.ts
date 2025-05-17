import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-card',
  imports: [SkeletonModule],
  templateUrl: './skeleton-card.component.html',
  styleUrl: './skeleton-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardComponent {}
