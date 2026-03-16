import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { 
  ExecutiveDashboardService, 
  ExecutiveDashboardResponse, 
  DashboardFilters 
} from '../executive-dashboard.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './executive-dashboard.component.html',
  styleUrl: './executive-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveDashboardComponent {
  dashboardService = inject(ExecutiveDashboardService);
  
  // Filters
  filters = signal<DashboardFilters>({});
  
  // Dashboard data
  dashboardResource = rxResource<ExecutiveDashboardResponse | null, DashboardFilters>({
    request: () => this.filters(),
    loader: ({ request }) => {
      return this.dashboardService.getMetrics(request);
    },
  });
  
  // Computed values
  metrics = computed(() => this.dashboardResource.value()?.metrics || null);
  branches = computed(() => this.dashboardResource.value()?.branches || []);
  
  // NPS classification
  npsClass = computed(() => {
    const nps = this.metrics()?.avg_nps ?? null;
    return this.dashboardService.getNpsClassification(nps);
  });
  
  // Emotion chart data
  emotionData = computed(() => {
    const m = this.metrics();
    if (!m) return null;
    
    const total = m.positive_interactions + m.negative_interactions + m.neutral_interactions;
    if (total === 0) return null;
    
    return {
      positive: {
        count: m.positive_interactions,
        pct: (m.positive_interactions / total * 100).toFixed(1)
      },
      negative: {
        count: m.negative_interactions,
        pct: (m.negative_interactions / total * 100).toFixed(1)
      },
      neutral: {
        count: m.neutral_interactions,
        pct: (m.neutral_interactions / total * 100).toFixed(1)
      }
    };
  });
  
  // Filter handlers
  setDateRange(range: 'week' | 'month' | 'quarter' | 'year') {
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    this.filters.update(f => ({
      ...f,
      start_date: start.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    }));
  }
  
  clearFilters() {
    this.filters.set({});
  }
  
  formatPct(value: number | null): string {
    return this.dashboardService.formatPercentage(value);
  }
  
  getRisk(score: number | null) {
    return this.dashboardService.getRiskLevel(score);
  }
}
