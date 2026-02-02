import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { ShareToasterService } from '@core/services/toast.service';
import {
  IntelligenceService,
  Insight,
  InsightSummary,
  InsightTrends,
  TopAction,
} from './intelligence.service';
import { ExecutiveEvidenceComponent } from '../clips/executive-evidence.component';

@Component({
  selector: 'app-intelligence',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ExecutiveEvidenceComponent],
  templateUrl: './intelligence.component.html',
})
export class IntelligenceComponent implements OnInit {
  private intelligenceService = inject(IntelligenceService);
  private toastService = inject(ShareToasterService);

  // Signals for Phase 2
  insights = signal<Insight[]>([]);
  summary = signal<InsightSummary | null>(null);
  trends = signal<InsightTrends | null>(null);
  topActions = signal<TopAction[]>([]);
  loading = signal(true);
  selectedSeverity = signal<string>('');
  unreadOnly = signal(false);
  
  // Evidence viewer
  selectedEvaluationId = signal<number | null>(null);
  showEvidencePanel = signal(false);

  // Computed values
  filteredInsights = computed(() => {
    let filtered = this.insights();
    if (this.selectedSeverity()) {
      filtered = filtered.filter(i => i.severity === this.selectedSeverity());
    }
    if (this.unreadOnly()) {
      filtered = filtered.filter(i => !i.is_read);
    }
    return filtered;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load summary
    this.intelligenceService.getInsightsSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => {
        console.error('Error loading summary:', err);
        this.summary.set({ critical: 0, high: 0, medium: 0, low: 0, total_unread: 0 });
      },
    });

    // Load insights
    this.intelligenceService.getInsights({ limit: 50 }).subscribe({
      next: (response) => this.insights.set(response.data || []),
      error: (err) => {
        console.error('Error loading insights:', err);
        this.insights.set([]);
      },
    });

    // Load trends
    this.intelligenceService.getTrends(30).subscribe({
      next: (data) => this.trends.set(data),
      error: (err) => {
        console.error('Error loading trends:', err);
        this.trends.set(null);
      },
    });

    // Load top actions
    this.intelligenceService.getTopActions(5).subscribe({
      next: (response) => {
        this.topActions.set(response.top_actions || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading top actions:', err);
        this.topActions.set([]);
        this.loading.set(false);
      },
    });
  }

  filterBySeverity(severity: string): void {
    this.selectedSeverity.set(severity);
  }

  toggleUnreadOnly(): void {
    this.unreadOnly.set(!this.unreadOnly());
  }

  markAsRead(insight: Insight): void {
    this.intelligenceService.markInsightAsRead(insight.id).subscribe({
      next: () => {
        // Update local state
        this.insights.update(list =>
          list.map(i => (i.id === insight.id ? { ...i, is_read: true } : i))
        );
        this.toastService.showToast('success', 'Éxito', 'Insight marcado como leído');
      },
      error: (err) => {
        console.error('Error marking insight:', err);
        this.toastService.showToast('error', 'Error', 'Error al marcar insight');
      },
    });
  }

  getSeverityClass(severity: string): string {
    const classes: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      trend: '📈',
      alert: '⚠️',
      recommendation: '💡',
      anomaly: '🔍',
      performance: '🎯',
      quality: '⭐',
    };
    return icons[type] || '📊';
  }

  sumData(data: number[]): number {
    return data.reduce((acc, val) => acc + val, 0);
  }

  // Evidence methods
  viewEvidence(insight: Insight): void {
    if (insight.evaluation_id) {
      this.selectedEvaluationId.set(insight.evaluation_id);
      this.showEvidencePanel.set(true);
    } else {
      this.toastService.showToast('warning', 'Sin evidencia', 'Este insight no tiene evaluación asociada');
    }
  }

  closeEvidencePanel(): void {
    this.showEvidencePanel.set(false);
    this.selectedEvaluationId.set(null);
  }
}
