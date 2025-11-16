import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntelligenceService, Insight, InsightSummary, Trend } from '../../services/intelligence.service';
import { ShareToasterService } from '../../services/toast.service';

@Component({
  selector: 'app-intelligence-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intelligence-dashboard.component.html',
  styleUrls: ['./intelligence-dashboard.component.scss']
})
export class IntelligenceDashboardComponent implements OnInit {
  insights: Insight[] = [];
  summary: InsightSummary | null = null;
  trends: Trend[] = [];
  topActions: any[] = [];
  loading = true;
  selectedCategory: string | null = null;
  selectedPriority: string | null = null;

  constructor(
    private intelligenceService: IntelligenceService,
    private toastService: ShareToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load summary
    this.intelligenceService.getInsightsSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (err) => {
        console.error('Error loading summary:', err);
        this.toastService.showError('Error al cargar resumen de inteligencia');
      }
    });

    // Load insights
    this.loadInsights();

    // Load trends
    this.intelligenceService.getTrends({ limit: 5 }).subscribe({
      next: (trends) => {
        this.trends = trends;
      },
      error: (err) => {
        console.error('Error loading trends:', err);
      }
    });

    // Load top actions
    this.intelligenceService.getTopActions(5).subscribe({
      next: (actions) => {
        this.topActions = actions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading top actions:', err);
        this.loading = false;
      }
    });
  }

  loadInsights(): void {
    const params: any = {};
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedPriority) params.priority = this.selectedPriority;

    this.intelligenceService.getInsights(params).subscribe({
      next: (insights) => {
        this.insights = insights;
      },
      error: (err) => {
        console.error('Error loading insights:', err);
        this.toastService.showError('Error al cargar insights');
      }
    });
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
    this.loadInsights();
  }

  filterByPriority(priority: string | null): void {
    this.selectedPriority = priority;
    this.loadInsights();
  }

  markAsRead(insight: Insight): void {
    this.intelligenceService.markInsightAsRead(insight.id).subscribe({
      next: () => {
        insight.is_read = true;
        this.toastService.showSuccess('Insight marcado como leído');
      },
      error: (err) => {
        console.error('Error marking insight as read:', err);
        this.toastService.showError('Error al marcar insight');
      }
    });
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      trend: '📈',
      alert: '⚠️',
      recommendation: '💡',
      anomaly: '🔍'
    };
    return icons[category] || '📊';
  }

  getTrendIcon(direction: string): string {
    return direction === 'up' ? '↗️' : direction === 'down' ? '↘️' : '→';
  }
}
