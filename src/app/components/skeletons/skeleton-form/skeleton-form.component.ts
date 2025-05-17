import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-form',
  imports: [SkeletonModule],
  templateUrl: './skeleton-form.component.html',
  styleUrl: './skeleton-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonFormComponent {}
