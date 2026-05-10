import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';

import {
  EndClient,
  FieldFrameworkTemplate,
  FieldInstrumentRevision,
  FieldProject,
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

type Phase = 'setup' | 'instrument';

@Component({
  selector: 'app-field-pre-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-pre-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPreFieldComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fieldSvc = inject(FieldService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ShareToasterService);
  private readonly cdr = inject(ChangeDetectorRef);

  private paramSub?: Subscription;

  readonly studyTypeOptions = STUDY_TYPE_OPTIONS;

  readonly phase = signal<Phase>('setup');
  readonly loading = signal(false);
  readonly setupSubmitting = signal(false);
  readonly saving = signal(false);
  readonly templatesLoading = signal(false);

  readonly studyId = signal<number | null>(null);
  readonly studyTitle = signal<string | null>(null);
  readonly projectId = signal<number | null>(null);
  readonly projectCompanyId = signal<number | null>(null);
  readonly contextProjectLabel = signal<string | null>(null);

  readonly templates = signal<FieldFrameworkTemplate[]>([]);
  readonly revisions = signal<FieldInstrumentRevision[]>([]);

  readonly projectsPicklist = signal<FieldProject[]>([]);
  readonly clientsPicklist = signal<EndClient[]>([]);

  readonly studyTypeFilter = signal('');
  revisionLabel = '';
  notes = '';
  selectedTemplateSlug = '';

  /** Paso 1 — objetivo de negocio / investigación (no es jargon técnico). */
  businessObjective = '';

  /** Proyecto existente vs crear nuevo. */
  projectLinkMode: 'existing' | 'new' = 'existing';

  selectedExistingProjectId: number | null = null;
  newProjectName = '';
  selectedClientId: number | null = null;

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
      this.selectedExistingProjectId = pid;
      this.projectLinkMode = 'existing';
      this.bootstrapFromRouteProject(pid);
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  setProjectLinkMode(mode: 'existing' | 'new'): void {
    this.projectLinkMode = mode;
    this.cdr.markForCheck();
  }

  backToSetup(): void {
    this.phase.set('setup');
    this.cdr.markForCheck();
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

  submitSetup(): void {
    const objective = this.businessObjective.trim();
    if (objective.length < 8) {
      this.toast.showToast('warn', 'PRE-FIELD', 'Describa el objetivo del estudio en al menos unas pocas palabras.');
      return;
    }

    const cid = this.resolveWriteCompanyId();
    if (cid == null) {
      this.toast.showToast(
        'error',
        'PRE-FIELD',
        'No se pudo determinar la empresa. Abra PRE-FIELD desde un proyecto Field o use un usuario con empresa asignada.'
      );
      return;
    }

    if (this.projectLinkMode === 'existing') {
      const pid = this.selectedExistingProjectId;
      if (pid == null || !Number.isFinite(pid)) {
        this.toast.showToast('error', 'PRE-FIELD', 'Seleccione un proyecto Field.');
        return;
      }
      this.setupSubmitting.set(true);
      this.fieldSvc.getProjectOverview(pid, 1).subscribe({
        next: row => {
          this.projectCompanyId.set(row.project.company_id);
          this.contextProjectLabel.set(row.project.name);
          this.ensureStudyThenInstrument(pid, row, objective);
        },
        error: () => {
          this.setupSubmitting.set(false);
          this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el proyecto seleccionado.');
        },
      });
      return;
    }

    const pname = this.newProjectName.trim();
    const clientId = this.selectedClientId;
    if (!pname) {
      this.toast.showToast('error', 'PRE-FIELD', 'Indique el nombre del proyecto Field.');
      return;
    }
    if (clientId == null) {
      this.toast.showToast('error', 'PRE-FIELD', 'Seleccione el cliente / cuenta del proyecto.');
      return;
    }

    const cqBody = this.companyBodyField(cid);
    const studyName = this.studyTitleFromObjective(objective, pname);

    this.setupSubmitting.set(true);
    this.fieldSvc
      .createStudy({
        name: studyName,
        description: objective,
        client_id: clientId,
        company_id: cqBody,
      })
      .pipe(
        switchMap(study =>
          this.fieldSvc.createProject({
            name: pname,
            description: objective.slice(0, 500),
            client_id: clientId,
            company_id: cqBody,
            study_id: study.id,
          })
        )
      )
      .subscribe({
        next: project => {
          this.setupSubmitting.set(false);
          this.toast.showToast('success', 'PRE-FIELD', 'Proyecto y estudio creados. Ya puede definir el instrumento.');
          this.router.navigate(['/field/project', project.id, 'pre-field'], {
            queryParams: { ready: '1' },
            replaceUrl: true,
          });
        },
        error: () => {
          this.setupSubmitting.set(false);
          this.toast.showToast('error', 'PRE-FIELD', 'No se pudo crear el proyecto o el estudio. Revise permisos y datos.');
        },
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
    const obj = this.businessObjective.trim();
    if (nt) {
      body.notes = nt;
    } else if (obj) {
      body.notes = obj.slice(0, 2000);
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
        this.cdr.markForCheck();
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

  private bootstrapFromRouteProject(projectId: number): void {
    this.loading.set(true);
    this.fieldSvc.getProjectOverview(projectId, 1).subscribe({
      next: row => {
        this.contextProjectLabel.set(row.project.name);
        this.projectCompanyId.set(row.project.company_id);
        this.loading.set(false);
        this.loadPicklists(row.project.company_id);
        const sid = row.project.study_id ?? null;
        const forceInstrument = this.route.snapshot.queryParamMap.get('ready') === '1';
        if (sid != null && (this.phase() === 'instrument' || forceInstrument)) {
          if (forceInstrument) {
            this.phase.set('instrument');
          }
          this.studyId.set(sid);
          this.studyTitle.set(row.study_display_name);
          this.reloadTemplates();
          this.reloadRevisions();
          if (forceInstrument) {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {},
              replaceUrl: true,
            });
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el proyecto.');
      },
    });
  }

  private loadPicklists(companyId: number): void {
    forkJoin({
      projects: this.fieldSvc.listProjects(companyId),
      clients: this.fieldSvc.listEndClients(companyId),
    }).subscribe({
      next: ({ projects, clients }) => {
        this.projectsPicklist.set(projects);
        this.clientsPicklist.set(clients);
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.showToast('warn', 'PRE-FIELD', 'No se pudieron cargar todos los listados; puede elegir proyecto desde la URL actual.');
      },
    });
  }

  private ensureStudyThenInstrument(
    projectId: number,
    overviewRow: { project: FieldProject; study_display_name: string | null },
    objective: string
  ): void {
    const proj = overviewRow.project;
    const existingSid = proj.study_id ?? null;

    if (existingSid != null) {
      this.projectId.set(projectId);
      this.studyId.set(existingSid);
      this.studyTitle.set(overviewRow.study_display_name);
      this.setupSubmitting.set(false);
      this.enterInstrumentPhase();
      return;
    }

    const studyName = this.studyTitleFromObjective(objective, proj.name);
    const cq = this.companyBodyField(proj.company_id);

    this.fieldSvc
      .createStudy({
        name: studyName,
        description: objective,
        client_id: proj.client_id,
        company_id: cq,
      })
      .pipe(
        switchMap(study =>
          this.fieldSvc.patchProject(projectId, { study_id: study.id }).pipe(map(() => study))
        )
      )
      .subscribe({
        next: study => {
          this.setupSubmitting.set(false);
          this.studyId.set(study.id);
          this.studyTitle.set(study.name);
          this.projectId.set(projectId);
          this.toast.showToast(
            'success',
            'PRE-FIELD',
            'Hemos creado el estudio de proyecto y lo hemos vinculado a este proyecto Field. Ya puede definir el instrumento.'
          );
          this.enterInstrumentPhase();
        },
        error: () => {
          this.setupSubmitting.set(false);
          this.toast.showToast(
            'error',
            'PRE-FIELD',
            'No se pudo crear o vincular el estudio de proyecto. Inténtelo de nuevo o revise permisos.'
          );
        },
      });
  }

  private enterInstrumentPhase(): void {
    this.phase.set('instrument');
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid != null && cid != null) {
      this.reloadTemplates();
      this.reloadRevisions();
    }
    this.cdr.markForCheck();
  }

  private studyTitleFromObjective(objective: string, fallback: string): string {
    const line = objective.split('\n')[0]?.trim() ?? '';
    if (line.length <= 120) {
      return line || fallback;
    }
    return `${line.slice(0, 117)}…`;
  }

  private companyBodyField(companyId: number): number | undefined {
    return this.auth.getCurrentUser().role === 0 ? companyId : undefined;
  }

  private resolveWriteCompanyId(): number | null {
    const fromProj = this.projectCompanyId();
    if (fromProj != null) {
      return fromProj;
    }
    const u = this.auth.getCurrentUser();
    return u.company_id ?? null;
  }

  private companyQueryForApi(projectCompanyId: number): number | null {
    const user = this.auth.getCurrentUser();
    if (user.role === 0) {
      return projectCompanyId;
    }
    return null;
  }
}
