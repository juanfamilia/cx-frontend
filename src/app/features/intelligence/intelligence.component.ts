import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { ShareToasterService } from '@core/services/toast.service';
import { environment } from '@env/environment';
import {
  IntelligenceService,
  Insight,
  InsightSummary,
  InsightTrends,
  TopAction,
} from './intelligence.service';
import { ExecutiveEvidenceComponent } from '../clips/executive-evidence.component';

interface ActionPlanSummary {
  pending: number;
  in_progress: number;
  overdue: number;
  resolved: number;
  total: number;
}

@Component({
  selector: 'app-intelligence',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ExecutiveEvidenceComponent],
  templateUrl: './intelligence.component.html',
})
export class IntelligenceComponent implements OnInit {
  private intelligenceService = inject(IntelligenceService);
  private toastService = inject(ShareToasterService);
  private http = inject(HttpClient);

  insights = signal<Insight[]>([]);
  summary = signal<InsightSummary | null>(null);
  trends = signal<InsightTrends | null>(null);
  topActions = signal<TopAction[]>([]);
  actionPlanSummary = signal<ActionPlanSummary | null>(null);
  loading = signal(true);
  selectedSeverity = signal<string>('');
  unreadOnly = signal(false);

  selectedEvaluationId = signal<number | null>(null);
  showEvidencePanel = signal(false);

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

  unreadCount = computed(() => this.insights().filter(i => !i.is_read).length);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.intelligenceService.getInsightsSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.summary.set({ critical: 0, high: 0, medium: 0, low: 0, total_unread: 0 }),
    });

    this.intelligenceService.getInsights({ limit: 50 }).subscribe({
      next: (response) => this.insights.set(response.data || []),
      error: () => this.insights.set([]),
    });

    this.intelligenceService.getTrends(30).subscribe({
      next: (data) => this.trends.set(data),
      error: () => this.trends.set(null),
    });

    this.intelligenceService.getTopActions(5).subscribe({
      next: (response) => this.topActions.set(response.top_actions || []),
      error: () => this.topActions.set([]),
    });

    this.http.get<{ data: { status: string }[]; total: number }>(`${environment.apiUrl}action-plans/?limit=200`).subscribe({
      next: (res) => {
        const items = res.data || [];
        const now = new Date();
        this.actionPlanSummary.set({
          total: res.total,
          pending: items.filter(p => p.status === 'pending').length,
          in_progress: items.filter(p => p.status === 'in_progress').length,
          overdue: items.filter((p: any) => p.status !== 'resolved' && p.due_date && new Date(p.due_date) < now).length,
          resolved: items.filter(p => p.status === 'resolved').length,
        });
        this.loading.set(false);
      },
      error: () => {
        this.actionPlanSummary.set(null);
        this.loading.set(false);
      },
    });
  }

  setSeverityFilter(severity: string): void {
    this.selectedSeverity.set(this.selectedSeverity() === severity ? '' : severity);
  }

  toggleUnreadOnly(): void {
    this.unreadOnly.set(!this.unreadOnly());
  }

  markAsRead(insight: Insight): void {
    this.intelligenceService.markInsightAsRead(insight.id).subscribe({
      next: () => {
        this.insights.update(list =>
          list.map(i => (i.id === insight.id ? { ...i, is_read: true } : i))
        );
      },
      error: () => this.toastService.showToast('error', 'Error', 'Error al marcar insight'),
    });
  }

  getSeverityBorderClass(severity: string): string {
    const map: Record<string, string> = {
      critical: 'border-l-red-500',
      high: 'border-l-orange-400',
      medium: 'border-l-yellow-400',
      low: 'border-l-blue-400',
    };
    return map[severity] || 'border-l-gray-300';
  }

  getSeverityBadgeClass(severity: string): string {
    const map: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[severity] || 'bg-gray-100 text-gray-700';
  }

  getSeverityChipActive(severity: string): string {
    const active: Record<string, string> = {
      critical: 'bg-red-500 text-white border-red-500',
      high: 'bg-orange-500 text-white border-orange-500',
      medium: 'bg-yellow-400 text-gray-900 border-yellow-400',
      low: 'bg-blue-500 text-white border-blue-500',
    };
    const inactive: Record<string, string> = {
      critical: 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
      high: 'border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20',
      medium: 'border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      low: 'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    };
    return this.selectedSeverity() === severity
      ? (active[severity] || 'bg-gray-500 text-white border-gray-500')
      : (inactive[severity] || 'border-gray-300 text-gray-600');
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      trend: 'Tendencia',
      alert: 'Alerta',
      recommendation: 'Recomendación',
      anomaly: 'Anomalía',
      performance: 'Rendimiento',
      quality: 'Calidad',
    };
    return map[type] || type;
  }

  getConfidenceBarColor(score: number): string {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-400';
  }

  sumData(data: number[]): number {
    return data.reduce((acc, val) => acc + val, 0);
  }

  maxFrequency(): number {
    const actions = this.topActions();
    return actions.length ? Math.max(...actions.map(a => a.frequency)) : 1;
  }

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
