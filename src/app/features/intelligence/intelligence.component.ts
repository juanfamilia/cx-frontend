import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { ShareToasterService } from '@core/services/toast.service';
import { environment } from '@env/environment';
import {
  IntelligenceService,
  Insight,
  InsightSummary,
  InsightTrends,
  PlatformMemoryEnvelope,
  PlatformSignalPublic,
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
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, ExecutiveEvidenceComponent],
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
  platformMemory = signal<PlatformMemoryEnvelope | null>(null);
  platformMemoryReady = signal(false);
  loading = signal(true);
  selectedSeverity = signal<string>('');
  unreadOnly = signal(false);
  signalDomainFilter = signal<string>('');

  selectedEvaluationId = signal<number | null>(null);
  showEvidencePanel = signal(false);

  readonly urgencyFilters = [
    { value: '', label: 'Todo', activeClass: 'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-gray-900' },
    { value: 'critical', label: 'Urgente', activeClass: 'bg-red-500 text-white border-red-500' },
    { value: 'high', label: 'Importante', activeClass: 'bg-orange-500 text-white border-orange-500' },
    { value: 'medium', label: 'En seguimiento', activeClass: 'bg-yellow-400 text-gray-900 border-yellow-400' },
    { value: 'low', label: 'Informativo', activeClass: 'bg-blue-500 text-white border-blue-500' },
  ];

  readonly signalDomainFilters = [
    { value: '', label: 'Todos' },
    { value: 'pre_field', label: 'PRE-FIELD' },
    { value: 'field', label: 'Field' },
    { value: 'cx', label: 'CX' },
    { value: 'ins', label: 'InS' },
    { value: 'clever', label: 'Clever' },
    { value: 'perfil', label: 'Perfil' },
  ];

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

  filteredPlatformSignals = computed(() => {
    const env = this.platformMemory();
    const list = env?.recent_signals ?? [];
    const d = this.signalDomainFilter();
    if (!d) {
      return list;
    }
    return list.filter((s) => s.source_domain === d);
  });

  planStatusItems = computed(() => {
    const s = this.actionPlanSummary();
    if (!s) return [];
    return [
      { label: 'Pendientes de inicio', count: s.pending, dot: 'bg-yellow-400', textColor: 'text-yellow-600 dark:text-yellow-400' },
      { label: 'En proceso', count: s.in_progress, dot: 'bg-blue-400', textColor: 'text-blue-600 dark:text-blue-400' },
      { label: 'Vencidos sin resolver', count: s.overdue, dot: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
      { label: 'Completados', count: s.resolved, dot: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
    ];
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.platformMemoryReady.set(false);

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

    this.intelligenceService
      .getPlatformMemory()
      .pipe(finalize(() => this.platformMemoryReady.set(true)))
      .subscribe({
        next: (env) => this.platformMemory.set(env),
        error: () => this.platformMemory.set(null),
      });

    this.http.get<{ data: { status: string; due_date?: string | null }[]; pagination: { total: number } }>(`${environment.apiUrl}action-plans/?limit=200`).subscribe({
      next: (res) => {
        const items = res.data || [];
        const now = new Date();
        this.actionPlanSummary.set({
          total: res.pagination?.total ?? items.length,
          pending: items.filter(p => p.status === 'pending').length,
          in_progress: items.filter(p => p.status === 'in_progress').length,
          overdue: items.filter(p => p.status !== 'resolved' && !!p.due_date && new Date(p.due_date!) < now).length,
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

  setSignalDomainFilter(domain: string): void {
    this.signalDomainFilter.set(this.signalDomainFilter() === domain ? '' : domain);
  }

  domainBadgeClass(domain: string): string {
    const map: Record<string, string> = {
      pre_field: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
      field: 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-200',
      cx: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
      ins: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
      clever: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200',
      perfil: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    };
    return map[domain] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }

  domainShortLabel(domain: string): string {
    const map: Record<string, string> = {
      pre_field: 'PRE-FIELD',
      field: 'Field',
      cx: 'CX',
      ins: 'InS',
      clever: 'Clever',
      perfil: 'Perfil',
    };
    return map[domain] ?? domain;
  }

  numericPayloadField(payload: Record<string, unknown>, key: string): number | null {
    const v = payload[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      return v;
    }
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }

  evaluationLinkId(signal: PlatformSignalPublic): number | null {
    return this.numericPayloadField(signal.payload ?? {}, 'evaluation_id');
  }

  fieldProjectLinkId(signal: PlatformSignalPublic): number | null {
    if (signal.field_project_id != null && Number.isFinite(signal.field_project_id)) {
      return signal.field_project_id;
    }
    return this.numericPayloadField(signal.payload ?? {}, 'field_project_id');
  }

  signalPayloadJson(signal: PlatformSignalPublic): string {
    try {
      return JSON.stringify(signal.payload ?? {}, null, 2);
    } catch {
      return '{}';
    }
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

  getUrgencyLabel(severity: string): string {
    const map: Record<string, string> = {
      critical: 'Urgente — actúa hoy',
      high: 'Importante',
      medium: 'En seguimiento',
      low: 'Para tu información',
    };
    return map[severity] ?? severity;
  }

  getUrgencyBannerClass(severity: string): string {
    const map: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-400 text-white',
      medium: 'bg-yellow-400 text-yellow-900',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[severity] ?? 'bg-gray-100 text-gray-700';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      trend: 'Tendencia detectada',
      alert: 'Alerta activa',
      recommendation: 'Recomendación de la IA',
      anomaly: 'Comportamiento inusual',
      performance: 'Rendimiento del equipo',
      quality: 'Calidad de servicio',
    };
    return map[type] ?? 'Situación detectada';
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
