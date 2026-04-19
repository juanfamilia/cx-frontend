import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { QualityFrameworkService } from '@pages/quality-framework/quality-framework.service';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { SuggestedSurveyAspectItem } from '@interfaces/quality-framework';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideClipboardList,
  lucideSlidersHorizontal,
} from '@ng-icons/lucide';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { catchError, EMPTY, finalize, forkJoin, of, switchMap } from 'rxjs';

export interface QualityConfigRowView {
  template_id: number;
  competency_id: number;
  competency_name: string;
  competency_code: string;
  is_mandatory: boolean;
  suggested_weight: number;
  is_enabled: boolean;
  custom_weight: number | null;
  custom_notes: string;
  config_id: number | null;
}

@Component({
  selector: 'app-configuration-quality',
  imports: [
    PageHeaderComponent,
    NgIcon,
    NgClass,
    FormsModule,
    ToggleSwitchModule,
    ButtonSecondaryComponent,
  ],
  templateUrl: './configuration-quality.component.html',
  styleUrl: './configuration-quality.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideClipboardList,
      lucideSlidersHorizontal,
    }),
  ],
})
export class ConfigurationQualityComponent implements OnInit {
  private auth = inject(AuthService);
  private qf = inject(QualityFrameworkService);
  private toast = inject(ShareToasterService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loading = signal(true);
  noIndustry = signal(false);
  rows = signal<QualityConfigRowView[]>([]);
  suggestedItems = signal<SuggestedSurveyAspectItem[]>([]);
  rowSaving = signal<number | null>(null);

  private companyId = signal<number | null>(null);

  ngOnInit() {
    const uid = this.auth.getCurrentUser().company_id;
    this.companyId.set(uid);
    this.loadAll();
  }

  goBack() {
    this.router.navigate(['/configuration']);
  }

  loadAll() {
    const cid = this.companyId();
    if (cid == null) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.qf
      .getSuggestedSurveyAspects(cid)
      .pipe(
        switchMap(suggested => {
          if (!suggested.industry_id) {
            this.noIndustry.set(true);
            this.rows.set([]);
            this.suggestedItems.set([]);
            return of(null);
          }
          this.noIndustry.set(false);
          return forkJoin({
            suggested: of(suggested),
            templates: this.qf.listIndustryTemplates(suggested.industry_id),
            configs: this.qf.listCompanyCompetencyConfigs(cid),
          });
        }),
        catchError(() => {
          this.toast.showToast(
            'error',
            'Error',
            'No se pudo cargar el marco de calidad.'
          );
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(bundle => {
        if (
          bundle === null ||
          typeof bundle !== 'object' ||
          !('templates' in bundle)
        ) {
          return;
        }
        const { suggested, templates, configs } = bundle;
        const cmap = new Map(configs.map(c => [c.competency_id, c]));
        const views: QualityConfigRowView[] = templates.map(t => {
          const cfg = cmap.get(t.competency_id);
          const fromConfig = cfg ? cfg.is_enabled : true;
          const enabled = t.is_mandatory ? true : fromConfig;
          return {
            template_id: t.id,
            competency_id: t.competency_id,
            competency_name: t.competency?.name ?? `Competencia ${t.competency_id}`,
            competency_code: t.competency?.code ?? '',
            is_mandatory: t.is_mandatory,
            suggested_weight: t.suggested_weight,
            is_enabled: enabled,
            custom_weight: cfg?.custom_weight ?? null,
            custom_notes: cfg?.custom_notes ?? '',
            config_id: cfg?.id ?? null,
          };
        });
        this.rows.set(views);
        this.suggestedItems.set(suggested.items);
      });
  }

  onToggleEnabled(row: QualityConfigRowView, enabled: boolean) {
    if (row.is_mandatory && !enabled) {
      this.toast.showToast(
        'warn',
        'Competencia obligatoria',
        'No puede desactivar una competencia marcada como obligatoria en el template sectorial.'
      );
      return;
    }
    const cid = this.companyId();
    if (cid == null) {
      return;
    }
    this.rowSaving.set(row.competency_id);
    this.qf
      .upsertCompanyCompetencyConfig(cid, {
        company_id: cid,
        competency_id: row.competency_id,
        is_enabled: enabled,
        custom_weight: row.custom_weight,
        custom_notes: row.custom_notes?.trim() || null,
      })
      .pipe(
        finalize(() => this.rowSaving.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          this.rows.update(list =>
            list.map(r =>
              r.competency_id === row.competency_id
                ? {
                    ...r,
                    is_enabled: enabled,
                    config_id: res.id,
                  }
                : r
            )
          );
          this.refreshSuggestedOnly(cid);
          this.toast.showToast('success', 'Guardado', 'Competencia actualizada.');
        },
        error: () =>
          this.toast.showToast('error', 'Error', 'No se pudo guardar el cambio.'),
      });
  }

  saveWeightAndNotes(row: QualityConfigRowView) {
    const cid = this.companyId();
    if (cid == null) {
      return;
    }
    const w = row.custom_weight;
    if (w !== null && w !== undefined && (w < 0 || w > 10)) {
      this.toast.showToast('warn', 'Peso', 'Use un valor entre 0 y 10.');
      return;
    }
    this.rowSaving.set(row.competency_id);
    this.qf
      .upsertCompanyCompetencyConfig(cid, {
        company_id: cid,
        competency_id: row.competency_id,
        is_enabled: row.is_enabled,
        custom_weight: w,
        custom_notes: row.custom_notes?.trim() || null,
      })
      .pipe(
        finalize(() => this.rowSaving.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          this.rows.update(list =>
            list.map(r =>
              r.competency_id === row.competency_id
                ? { ...r, config_id: res.id, custom_weight: res.custom_weight }
                : r
            )
          );
          this.refreshSuggestedOnly(cid);
          this.toast.showToast('success', 'Guardado', 'Peso y notas actualizados.');
        },
        error: () =>
          this.toast.showToast('error', 'Error', 'No se pudo guardar.'),
      });
  }

  onWeightInput(row: QualityConfigRowView, ev: Event) {
    const v = (ev.target as HTMLInputElement).value.trim();
    this.rows.update(rs =>
      rs.map(r =>
        r.competency_id === row.competency_id
          ? {
              ...r,
              custom_weight: v === '' ? null : Number(v),
            }
          : r
      )
    );
  }

  onNotesInput(row: QualityConfigRowView, ev: Event) {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.rows.update(rs =>
      rs.map(r =>
        r.competency_id === row.competency_id ? { ...r, custom_notes: v } : r
      )
    );
  }

  private refreshSuggestedOnly(companyId: number) {
    this.qf
      .getSuggestedSurveyAspects(companyId)
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(s => this.suggestedItems.set(s.items));
  }
}
