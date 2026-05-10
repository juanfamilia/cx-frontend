import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';

import {
  FieldFrameworkTemplate,
  FieldInstrumentRevision,
  FieldService,
} from './field.service';

/** Valores de `study_type` en `instrument_spec` (filtro de catálogo). */
const STUDY_TYPE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'cx', label: 'CX' },
  { value: 'ua', label: 'U&A' },
  { value: 'brand_tracking', label: 'Brand tracking' },
  { value: 'concept_test', label: 'Concept test' },
  { value: 'mystery_shopper', label: 'Mystery shopper' },
  { value: 'focus_group', label: 'Focus group' },
  { value: 'other', label: 'Otro / genérico' },
] as const;

@Component({
  selector: 'app-field-pre-field',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './field-pre-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPreFieldComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ShareToasterService);

  private paramSub?: Subscription;

  readonly studyTypeOptions = STUDY_TYPE_OPTIONS;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly templatesLoading = signal(false);

  readonly studyId = signal<number | null>(null);
  readonly studyTitle = signal<string | null>(null);
  readonly projectId = signal<number | null>(null);
  readonly projectCompanyId = signal<number | null>(null);

  readonly templates = signal<FieldFrameworkTemplate[]>([]);
  readonly revisions = signal<FieldInstrumentRevision[]>([]);

  readonly studyTypeFilter = signal('');
  revisionLabel = '';
  notes = '';
  selectedTemplateSlug = '';

  ngOnInit(): void {
    const parent = this.route.parent;
    if (!parent) {
      return;
    }
    this.paramSub = parent.paramMap.subscribe(pm => {
      const pid = Number(pm.get('projectId'));
      if (!Number.isFinite(pid)) {
        return;
      }
      this.projectId.set(pid);
      this.loadProject(pid);
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  onStudyTypeFilterChange(value: string): void {
    this.studyTypeFilter.set(value);
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid != null && cid != null) {
      this.reloadTemplates();
    }
  }

  reloadTemplates(): void {
    const filter = this.studyTypeFilter().trim();
    this.templatesLoading.set(true);
    this.fieldSvc.listFrameworkTemplates(filter || undefined).subscribe({
      next: rows => {
        this.templates.set(rows);
        this.templatesLoading.set(false);
      },
      error: () => {
        this.templatesLoading.set(false);
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el catálogo de plantillas.');
      },
    });
  }

  reloadRevisions(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.fieldSvc.listInstrumentRevisions(sid, cq).subscribe({
      next: rows => this.revisions.set(rows),
      error: () =>
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudieron cargar las revisiones del instrumento.'),
    });
  }

  submitCreate(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      return;
    }
    const slug = this.selectedTemplateSlug.trim();
    const body: {
      revision_label?: string;
      notes?: string;
      framework_template_slug?: string;
      framework_template_version?: string;
    } = {};
    const rl = this.revisionLabel.trim();
    if (rl) {
      body.revision_label = rl;
    }
    const nt = this.notes.trim();
    if (nt) {
      body.notes = nt;
    }
    if (slug) {
      body.framework_template_slug = slug;
      body.framework_template_version = '2026.1';
    }

    this.saving.set(true);
    const cq = this.companyQueryForApi(cid);
    this.fieldSvc.createInstrumentRevision(sid, body, cq).subscribe({
      next: () => {
        this.saving.set(false);
        this.revisionLabel = '';
        this.notes = '';
        this.selectedTemplateSlug = '';
        this.toast.showToast('success', 'PRE-FIELD', 'Revisión borrador creada.');
        this.reloadRevisions();
      },
      error: () => {
        this.saving.set(false);
        this.toast.showToast(
          'error',
          'PRE-FIELD',
          'No se pudo crear la revisión (permisos, etiqueta duplicada o plantilla no encontrada).'
        );
      },
    });
  }

  private loadProject(projectId: number): void {
    this.loading.set(true);
    this.studyId.set(null);
    this.fieldSvc.getProjectOverview(projectId, 1).subscribe({
      next: row => {
        const sid = row.project.study_id ?? null;
        this.studyTitle.set(row.study_display_name);
        this.projectCompanyId.set(row.project.company_id);
        this.studyId.set(sid);
        this.loading.set(false);
        if (sid != null) {
          this.reloadTemplates();
          this.reloadRevisions();
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el proyecto.');
      },
    });
  }

  private companyQueryForApi(projectCompanyId: number): number | null {
    const user = this.auth.getCurrentUser();
    if (user.role === 0) {
      return projectCompanyId;
    }
    return null;
  }
}
