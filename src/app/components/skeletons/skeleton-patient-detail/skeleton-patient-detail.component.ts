import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-patient-detail',
  imports: [SkeletonModule],
  templateUrl: './skeleton-patient-detail.component.html',
  styleUrl: './skeleton-patient-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPatientDetailComponent {}
