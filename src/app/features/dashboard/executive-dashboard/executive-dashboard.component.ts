import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CompanyList } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';
import {
  ExecutiveDashboardService,
  ExecutiveDashboardResponse,
  DashboardFilters,
} from '../executive-dashboard.service';

/** OpenAPI `InteractionTypeEnum`. */
const INTERACTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'callcenter', label: 'Call center' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'videollamada', label: 'Videollamada' },
  { value: 'otro', label: 'Otro' },
];

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
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);

  readonly interactionTypeOptions = INTERACTION_TYPE_OPTIONS;

  /** Superadmin / usuario sin compañía asignada: deben elegir `company_id` para métricas. */
  pickerNeeded = signal(false);

  filters = signal<DashboardFilters>({});

  constructor() {
    try {
      const u = this.authService.getCurrentUser();
      const needPicker = u.role === 0 || u.company_id == null || u.company_id <= 0;
      this.pickerNeeded.set(needPicker);
      if (u.company_id != null && u.company_id > 0) {
        this.filters.set({ company_id: u.company_id });
      }
    } catch {
      /* sin sesión */
    }
  }

  /** No llamar al API hasta tener alcance de compañía cuando el backend lo exige. */
  metricsRequestReady = computed(() => {
    if (!this.pickerNeeded()) {
      return true;
    }
    const id = this.filters().company_id;
    return id != null && id > 0;
  });

  awaitingCompanySelection = computed(
    () => this.pickerNeeded() && !this.metricsRequestReady()
  );

  companySelectModel = computed(() => {
    const id = this.filters().company_id;
    return id != null && id > 0 ? String(id) : '';
  });

  companiesResource = rxResource<CompanyList, boolean>({
    request: () => this.pickerNeeded(),
    loader: ({ request }) =>
      request
        ? this.companiesService.getAll(0, 100)
        : of({ data: [], pagination: { first: 0, rows: 0, total: 0 } }),
  });

  dashboardResource = rxResource<
    ExecutiveDashboardResponse | null,
    { filters: DashboardFilters; ready: boolean }
  >({
    request: () => ({
      filters: this.filters(),
      ready: this.metricsRequestReady(),
    }),
    loader: ({ request }) => {
      if (!request.ready) {
        return of(null);
      }
      return this.dashboardService.getMetrics(request.filters);
    },
  });

  metrics = computed(() => this.dashboardResource.value()?.metrics ?? null);
  branches = computed(() => this.dashboardResource.value()?.branches ?? []);

  npsClass = computed(() => {
    const nps = this.metrics()?.avg_nps ?? null;
    return this.dashboardService.getNpsClassification(nps);
  });

  emotionData = computed(() => {
    const m = this.metrics();
    if (!m) {
      return null;
    }

    const total =
      m.positive_interactions + m.negative_interactions + m.neutral_interactions;
    if (total === 0) {
      return null;
    }

    return {
      positive: {
        count: m.positive_interactions,
        pct: ((m.positive_interactions / total) * 100).toFixed(1),
      },
      negative: {
        count: m.negative_interactions,
        pct: ((m.negative_interactions / total) * 100).toFixed(1),
      },
      neutral: {
        count: m.neutral_interactions,
        pct: ((m.neutral_interactions / total) * 100).toFixed(1),
      },
    };
  });

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
      end_date: today.toISOString().split('T')[0],
    }));
  }

  clearFilters() {
    const company_id = this.filters().company_id;
    this.filters.set(company_id != null ? { company_id } : {});
  }

  onCompanyChange(raw: string) {
    const id = raw ? Number(raw) : NaN;
    this.filters.update(f => ({
      ...f,
      company_id:
        Number.isFinite(id) && id > 0 ? id : undefined,
    }));
  }

  onBranchChange(value: string) {
    const v = value.trim();
    this.filters.update(f => ({
      ...f,
      branch_id: v ? v : undefined,
    }));
  }

  onCountryChange(value: string) {
    const v = value.trim();
    this.filters.update(f => ({
      ...f,
      country: v ? v : undefined,
    }));
  }

  onInteractionTypeChange(value: string) {
    this.filters.update(f => ({
      ...f,
      interaction_type: value ? value : undefined,
    }));
  }

  formatPct(value: number | null): string {
    return this.dashboardService.formatPercentage(value);
  }

  getRisk(score: number | null) {
    return this.dashboardService.getRiskLevel(score);
  }

  isDefinedRate(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && !Number.isNaN(value);
  }

  progressWidth(value: number | null | undefined): number {
    return this.isDefinedRate(value) ? (value as number) : 0;
  }
}
