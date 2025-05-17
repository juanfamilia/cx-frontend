import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-consultation-detail',
  imports: [SkeletonModule],
  templateUrl: './skeleton-consultation-detail.component.html',
  styleUrl: './skeleton-consultation-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonConsultationDetailComponent {}
