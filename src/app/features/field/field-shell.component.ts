import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldRiskBadgeComponent } from './components/field-risk-badge.component';
import { FieldPrimaryNavTabsComponent } from './components/field-primary-nav-tabs.component';
import { FieldProjectOverviewRow, FieldService } from './field.service';
import {
  formatCompletionRatePct,
  healthExecutiveLabel,
  healthToRiskLevel,
  executiveHealthReason,
  fieldOverviewAllowsPrefield,
  openSeverityCount,
} from './field-ui.helpers';

@Component({
  selector: 'app-field-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FieldPrimaryNavTabsComponent,
    FieldRiskBadgeComponent,
  ],
  templateUrl: './field-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);

  readonly executiveHealthReason = executiveHealthReason;
  readonly fieldOverviewAllowsPrefield = fieldOverviewAllowsPrefield;

  private headerSub?: Subscription;

  readonly projectId = toSignal(
    this.route.paramMap.pipe(map(p => Number(p.get('projectId')))),
    { initialValue: NaN }
  );

  readonly safeProjectId = computed(() => {
    const id = this.projectId();
    return Number.isFinite(id) ? id : null;
  });

  readonly projectName = signal<string>('Proyecto');
  readonly loadError = signal<string | null>(null);
  readonly overviewRow = signal<FieldProjectOverviewRow | null>(null);

  readonly tabs = computed(() => {
    const id = this.projectId();
    if (!Number.isFinite(id)) {
      return [];
    }
    const base = `/field/project/${id}`;
    const prefieldTab = fieldOverviewAllowsPrefield(this.overviewRow())
      ? [{ label: 'Antes de campo', link: `${base}/pre-field`, fragment: undefined }]
      : [];
    return [
      { label: 'Control del proyecto', link: `${base}/dashboard`, fragment: undefined },
      { label: 'Hallazgos', link: `${base}/findings`, fragment: undefined },
      { label: 'Métricas y scoring', link: `${base}/scoring`, fragment: undefined },
      ...prefieldTab,
      { label: 'Resumen ejecutivo', link: `${base}/executive-summary`, fragment: undefined },
    ];
  });

  ngOnInit(): void {
    this.headerSub = this.route.paramMap.subscribe(p => {
      const raw = p.get('projectId');
      const id = raw ? Number(raw) : NaN;
      if (!Number.isFinite(id)) {
        return;
      }
      this.loadError.set(null);
      this.overviewRow.set(null);
      this.fieldSvc.getProjectOverview(id, 8).subscribe({
        next: row => {
          this.overviewRow.set(row);
          this.projectName.set(row.project?.name ?? `Proyecto #${id}`);
        },
        error: () => {
          this.loadError.set(
            'No se pudo cargar la información del proyecto. Compruebe permisos o vuelva al resumen de proyectos.'
          );
          this.projectName.set(`Proyecto #${id}`);
          this.overviewRow.set(null);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.headerSub?.unsubscribe();
  }

  shellHealthLabel(): string {
    return healthExecutiveLabel(this.overviewRow()?.health);
  }

  shellRiskLevel() {
    return healthToRiskLevel(this.overviewRow()?.health ?? 'green');
  }

  shellKpiProgress(): string {
    const ov = this.overviewRow();
    return ov ? formatCompletionRatePct(ov) : '—';
  }

  shellOpenCritical(): string {
    return String(openSeverityCount(this.overviewRow(), 'error'));
  }

  shellOpenWarn(): string {
    return String(openSeverityCount(this.overviewRow(), 'warn'));
  }

  shellPendingReview(): string {
    const n = this.overviewRow()?.findings_pending_review;
    return n != null ? String(n) : '—';
  }

  shellHealthReasons(): string[] {
    const r = this.overviewRow()?.health_reasons ?? [];
    return r.filter(x => typeof x === 'string' && x.trim().length > 0).slice(0, 4);
  }

  shellStudyLabel(): string {
    return this.overviewRow()?.study_display_name?.trim() || '';
  }

  shellClientLabel(): string {
    return this.overviewRow()?.client_display_name?.trim() || '';
  }
}
