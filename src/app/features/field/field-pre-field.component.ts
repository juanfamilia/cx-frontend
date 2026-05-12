import { CommonModule, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';

import {
  EndClient,
  FieldFrameworkTemplate,
  FieldFrameworkWaiverPublic,
  FieldInstrumentRevision,
  FieldInstrumentRevisionWithSpec,
  FieldProject,
  FieldReadinessGatePublic,
  FieldReadinessPolicyPublic,
  FieldService,
  FieldStudyBriefPublic,
} from './field.service';

import {
  executiveQaConsistencySummary,
  executiveReadinessBlocking,
  executiveStakeholderRole,
} from './field-ui.helpers';

/** Valores de `study_type` del diseño del cuestionario (filtro de catálogo). */
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

/** Sub-vista dentro del paso instrumento (Brief vs trabajo técnico). */
type InstrumentWorkbenchTab = 'brief' | 'instrument';

type PrefieldPipelineVariant = 'done' | 'active' | 'blocked' | 'muted';

interface PrefieldPipelineStepVm {
  key: string;
  title: string;
  caption: string;
  variant: PrefieldPipelineVariant;
}

@Component({
  selector: 'app-field-pre-field',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
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

  readonly executiveReadinessBlocking = executiveReadinessBlocking;
  readonly executiveStakeholderRole = executiveStakeholderRole;
  readonly executiveQaConsistencySummary = executiveQaConsistencySummary;

  private paramSub?: Subscription;

  /** Reintentos ante 404 del brief (réplica de lectura vs escritura recién después del alta). */
  private brief404Retries = 0;
  /** Un intento de recuperación vía PATCH vacío tras agotar reintentos GET (misma semántica ensure en servidor). */
  private briefPatchFallbackUsed = false;

  readonly studyTypeOptions = STUDY_TYPE_OPTIONS;

  readonly phase = signal<Phase>('setup');
  readonly instrumentTab = signal<InstrumentWorkbenchTab>('brief');

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

  readonly brief = signal<FieldStudyBriefPublic | null>(null);
  readonly briefLoading = signal(false);
  readonly briefSaving = signal(false);
  /** Mensaje tras fallo de GET/PATCH del brief (la pestaña no puede quedar en blanco). */
  readonly briefLoadError = signal<string | null>(null);
  readonly readinessPolicy = signal<FieldReadinessPolicyPublic | null>(null);
  readonly policyLoading = signal(false);

  readonly detailRevision = signal<FieldInstrumentRevisionWithSpec | null>(null);
  readonly detailLoading = signal(false);
  readonly detailWaivers = signal<FieldFrameworkWaiverPublic[]>([]);
  readonly detailWaiversLoading = signal(false);
  readonly readinessGate = signal<FieldReadinessGatePublic | null>(null);

  readonly waiverSubmitting = signal(false);

  readonly projectsPicklist = signal<FieldProject[]>([]);
  readonly clientsPicklist = signal<EndClient[]>([]);

  readonly studyTypeFilter = signal('');
  revisionLabel = '';
  notes = '';
  selectedTemplateSlug = '';

  /** Editor JSON del payload del brief (sincronizado al cargar). */
  briefPayloadText = '';
  /** Score 0–100 como texto (vacío = sin cambiar en algunos flujos). */
  briefCompletenessStr = '';
  waiverRationale = '';
  /** JSON opcional: lista u objeto de secciones relevadas del framework. */
  waiverSectionsJson = '';

  /** Paso 1 — objetivo de negocio / investigación (no es jargon técnico). */
  businessObjective = '';

  /** Proyecto existente vs crear nuevo. */
  projectLinkMode: 'existing' | 'new' = 'existing';

  selectedExistingProjectId: number | null = null;
  newProjectName = '';
  selectedClientId: number | null = null;

  readonly pipelineStepsView = computed(() => this.buildPipelineSteps());

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

  setInstrumentTab(tab: InstrumentWorkbenchTab): void {
    this.instrumentTab.set(tab);
    if (tab === 'brief' && this.phase() === 'instrument') {
      const sid = this.studyId();
      const cid = this.projectCompanyId();
      if (sid != null && cid != null && !this.briefLoading()) {
        if (this.brief() == null) {
          this.brief404Retries = 0;
          this.briefPatchFallbackUsed = false;
          this.reloadBrief();
        }
      }
    }
    this.cdr.markForCheck();
  }

  briefMeetsReadinessPolicy(): boolean {
    const p = this.readinessPolicy();
    const b = this.brief();
    if (!p?.require_brief_approved) {
      return true;
    }
    if (!b) {
      return false;
    }
    return this.briefApprovedForGate(b.approval_state);
  }

  briefApprovedForGate(state: string): boolean {
    return state === 'approved_internal' || state === 'approved';
  }

  briefStateLabel(state: string): string {
    switch (state) {
      case 'approved':
        return 'Aprobado (cliente)';
      case 'approved_internal':
        return 'Aprobado interno';
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'En revisión';
      default:
        return state;
    }
  }

  shortHash(value: string | null | undefined, len = 10): string {
    const v = (value ?? '').trim();
    if (!v) {
      return '—';
    }
    return v.length <= len ? v : `${v.slice(0, len)}…`;
  }

  revisionExecutiveStatus(status: string): string {
    const u = (status || '').toLowerCase();
    if (u === 'draft') {
      return 'Borrador';
    }
    if (u === 'active') {
      return 'Activa';
    }
    if (u === 'archived') {
      return 'Archivada';
    }
    return status || '—';
  }

  readinessAggregateExecutiveLabel(status: string): string {
    const x = (status || '').toLowerCase();
    if (x === 'ready') {
      return 'Listo para despliegue';
    }
    if (x === 'blocked') {
      return 'Bloqueado';
    }
    if (x === 'pending_signatures') {
      return 'Pendiente de firmas';
    }
    if (x === 'approved') {
      return 'Aprobado';
    }
    if (x === 'pending') {
      return 'En evaluación';
    }
    return status || '—';
  }

  briefWhatsMissingExecutive(br: FieldStudyBriefPublic): string {
    const pol = this.readinessPolicy();
    if (br.approval_state === 'approved') {
      return 'Nada pendiente en brief para esta etapa.';
    }
    if (br.approval_state === 'approved_internal') {
      if (pol?.require_brief_approved) {
        return 'Puede faltar el visto bueno del cliente según su proceso interno.';
      }
      return 'Brief listo según política de Readiness de la empresa.';
    }
    if (br.approval_state === 'draft') {
      const parts: string[] = ['Definir y guardar el contenido del brief.'];
      if (pol?.require_brief_approved) {
        parts.push('Obtener aprobación interna y, si aplica, la del cliente.');
      }
      return parts.join(' ');
    }
    return 'Revise el estado del brief con su equipo.';
  }

  briefWhoActsExecutive(br: FieldStudyBriefPublic): string {
    switch (br.approval_state) {
      case 'draft':
        return 'Investigación / diseño: completar brief y solicitar aprobación interna.';
      case 'approved_internal':
        return 'Dirección de cuenta o cliente: visto bueno final si su gobierno lo exige.';
      case 'approved':
        return 'Sin acción requerida en brief.';
      default:
        return 'Equipo de estudio: revisar estado del brief.';
    }
  }

  briefObjectiveSnippet(): string {
    const raw = this.briefPayloadText.trim();
    if (!raw) {
      return '';
    }
    try {
      const o = JSON.parse(raw) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        const obj = o as Record<string, unknown>;
        const objective = obj['objective'];
        if (typeof objective === 'string' && objective.trim()) {
          return objective.trim().slice(0, 280);
        }
      }
    } catch {
      /* texto libre */
    }
    return '';
  }

  /** Resumen de qué revisión centra el trabajo (panel abierto o última actividad). */
  focusRevisionHeadline(): string {
    const d = this.detailRevision();
    if (d) {
      return `${d.revision_label} · ${this.revisionExecutiveStatus(d.status)}`;
    }
    const revs = this.revisions();
    if (revs.length === 0) {
      return 'Sin borradores — cree la primera revisión';
    }
    const sorted = [...revs].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    const r = sorted[0];
    return `Última actividad: ${r.revision_label} — abra «Ver borrador» para consistencia y despliegue`;
  }

  pipelineStepCircleClass(variant: PrefieldPipelineVariant): Record<string, boolean> {
    return {
      'bg-emerald-500 text-white dark:bg-emerald-600': variant === 'done',
      'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900':
        variant === 'active',
      'bg-amber-500 text-white dark:bg-amber-600': variant === 'blocked',
      'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400': variant === 'muted',
    };
  }

  readinessAggregateBadgeClass(status: string): Record<string, boolean> {
    const x = (status || '').toLowerCase();
    return {
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-200':
        x === 'ready' || x === 'approved',
      'bg-amber-100 text-amber-950 dark:bg-amber-950/35 dark:text-amber-100':
        x === 'blocked' || x === 'pending_signatures',
      'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100':
        x !== 'ready' &&
        x !== 'approved' &&
        x !== 'blocked' &&
        x !== 'pending_signatures',
    };
  }

  private buildPipelineSteps(): PrefieldPipelineStepVm[] {
    const pol = this.readinessPolicy();
    const b = this.brief();
    const revs = this.revisions();
    const d = this.detailRevision();
    const gate = this.readinessGate();
    const waivers = this.detailWaivers();
    const bl = this.briefLoading();

    let briefVariant: PrefieldPipelineVariant = 'muted';
    let briefCap = 'Sin datos';
    if (bl) {
      briefVariant = 'active';
      briefCap = 'Cargando…';
    } else if (b) {
      const approved = this.briefApprovedForGate(b.approval_state);
      const briefBlocked = !!pol?.require_brief_approved && !approved;
      if (approved) {
        briefVariant = 'done';
        briefCap =
          b.approval_state === 'approved'
            ? 'Aprobado con cliente'
            : 'Listo según política de Readiness';
      } else if (briefBlocked) {
        briefVariant = 'blocked';
        briefCap = 'Aprobación requerida antes del gate';
      } else {
        briefVariant = 'active';
        briefCap = 'En preparación o en circuito de aprobación';
      }
    }

    let revVariant: PrefieldPipelineVariant;
    let revCap: string;
    if (revs.length === 0) {
      revVariant = 'active';
      revCap = 'Cree el primer borrador';
    } else if (d) {
      revVariant = 'done';
      revCap = `${d.revision_label} · ${this.revisionExecutiveStatus(d.status)}`;
    } else {
      revVariant = 'active';
      revCap = 'Seleccione revisión en la tabla';
    }

    let qaVariant: PrefieldPipelineVariant = 'muted';
    let qaCap = 'Abra una revisión';
    if (d) {
      if (d.last_validation_ok === false) {
        qaVariant = 'blocked';
        qaCap = 'Consistencia automática no superada';
      } else if (d.last_validation_ok === true) {
        qaVariant = 'done';
        qaCap = d.last_ruleset_version
          ? `Paquete de reglas ${d.last_ruleset_version}`
          : 'Última revisión de consistencia correcta';
      } else if (d.last_validation_at != null) {
        qaVariant = 'active';
        qaCap = 'Revise resultado en operaciones';
      } else {
        qaVariant = 'active';
        qaCap = 'Ejecute revisión de consistencia si procede';
      }
    }

    let waiverVariant: PrefieldPipelineVariant = 'muted';
    let waiverCap = 'Abra una revisión';
    if (d) {
      if (waivers.length > 0) {
        waiverVariant = 'done';
        waiverCap = `${waivers.length} registro(s) de excepción`;
      } else if (d.status === 'draft') {
        waiverVariant = 'active';
        waiverCap = 'Solo si hay acuerdo formal de excepción';
      } else {
        waiverVariant = 'done';
        waiverCap = 'Sin excepciones';
      }
    }

    let readinessVariant: PrefieldPipelineVariant = 'muted';
    let readinessCap = 'Abra una revisión';
    if (d && gate) {
      const blocked = gate.blocking_codes.length > 0;
      const agg = (gate.aggregate_status || '').toLowerCase();
      if (blocked) {
        readinessVariant = 'blocked';
        readinessCap = `${this.readinessAggregateExecutiveLabel(gate.aggregate_status)} · hay bloqueos`;
      } else if (agg === 'approved' || agg === 'ready') {
        readinessVariant = 'done';
        readinessCap = this.readinessAggregateExecutiveLabel(gate.aggregate_status);
      } else {
        readinessVariant = 'active';
        readinessCap = this.readinessAggregateExecutiveLabel(gate.aggregate_status);
      }
    } else if (d && !gate && !this.detailLoading()) {
      readinessVariant = 'active';
      readinessCap = 'Sin evaluación todavía';
    }

    return [
      { key: 'brief', title: 'Brief', caption: briefCap, variant: briefVariant },
      { key: 'revision', title: 'Revisión metodológica', caption: revCap, variant: revVariant },
      { key: 'qa', title: 'Consistencia', caption: qaCap, variant: qaVariant },
      { key: 'waiver', title: 'Excepciones', caption: waiverCap, variant: waiverVariant },
      { key: 'readiness', title: 'Despliegue', caption: readinessCap, variant: readinessVariant },
    ];
  }

  reloadReadinessPolicy(): void {
    const cid = this.projectCompanyId();
    if (cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.policyLoading.set(true);
    this.fieldSvc.getReadinessPolicy(cq).subscribe({
      next: pol => {
        this.readinessPolicy.set(pol);
        this.policyLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.policyLoading.set(false);
        this.readinessPolicy.set(null);
        this.cdr.markForCheck();
      },
    });
  }

  retryLoadBrief(): void {
    this.brief404Retries = 0;
    this.briefPatchFallbackUsed = false;
    this.briefLoadError.set(null);
    this.reloadBrief();
  }

  private applyBriefLoaded(sid: number, b: FieldStudyBriefPublic, cq: number | null): void {
    this.brief404Retries = 0;
    this.briefPatchFallbackUsed = false;
    this.briefLoadError.set(null);
    this.brief.set(b);
    this.briefPayloadText = JSON.stringify(b.payload_json ?? {}, null, 2);
    this.briefCompletenessStr =
      b.completeness_score != null && Number.isFinite(b.completeness_score)
        ? String(b.completeness_score)
        : '';
    this.briefLoading.set(false);
    this.maybeSeedBriefFromObjective(sid, b, cq);
    this.cdr.markForCheck();
  }

  private formatBriefHttpError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const raw = err.error?.detail;
      if (typeof raw === 'string') {
        return raw;
      }
      if (err.status === 0) {
        return 'Sin respuesta del servidor (red, CORS o certificado).';
      }
      return `No se pudo obtener el brief (HTTP ${err.status}).`;
    }
    return 'Error al cargar el brief.';
  }

  reloadBrief(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      if (this.phase() === 'instrument' && !this.loading()) {
        this.briefLoadError.set(
          'Faltan estudio o empresa en contexto. Recargue la página o complete el paso 1 y pulse «Continuar al instrumento».'
        );
      }
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.briefLoadError.set(null);
    this.briefLoading.set(true);
    this.fieldSvc.getStudyBrief(sid, cq).subscribe({
      next: b => this.applyBriefLoaded(sid, b, cq),
      error: err => {
        this.briefLoading.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 404 && this.brief404Retries < 4) {
          this.brief404Retries++;
          const delayMs = 350 * this.brief404Retries;
          window.setTimeout(() => {
            this.reloadBrief();
            this.cdr.markForCheck();
          }, delayMs);
          return;
        }
        if (status === 404 && !this.briefPatchFallbackUsed) {
          this.briefPatchFallbackUsed = true;
          this.briefLoading.set(true);
          this.fieldSvc.patchStudyBrief(sid, {}, cq).subscribe({
            next: b => this.applyBriefLoaded(sid, b, cq),
            error: errPatch => {
              this.briefLoading.set(false);
              this.briefPatchFallbackUsed = false;
              const detail = this.formatBriefHttpError(errPatch);
              this.briefLoadError.set(detail);
              this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el brief del estudio.');
              this.cdr.markForCheck();
            },
          });
          return;
        }
        this.brief404Retries = 0;
        this.briefPatchFallbackUsed = false;
        this.briefLoadError.set(this.formatBriefHttpError(err));
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el brief del estudio.');
        this.cdr.markForCheck();
      },
    });
  }

  private maybeSeedBriefFromObjective(
    studyId: number,
    briefRow: FieldStudyBriefPublic,
    cq: number | null
  ): void {
    if (briefRow.approval_state !== 'draft') {
      return;
    }
    const keys = Object.keys(briefRow.payload_json ?? {});
    if (keys.length > 0) {
      return;
    }
    const objective = this.businessObjective.trim();
    if (objective.length < 8) {
      return;
    }
    this.fieldSvc.patchStudyBrief(studyId, { payload: { objective } }, cq).subscribe({
      next: b => {
        this.brief.set(b);
        this.briefPayloadText = JSON.stringify(b.payload_json ?? {}, null, 2);
        this.cdr.markForCheck();
      },
      error: () => {
        /* seed opcional */
      },
    });
  }

  saveBriefPayload(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      return;
    }
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(this.briefPayloadText || '{}') as Record<string, unknown>;
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('root');
      }
    } catch {
      this.toast.showToast('error', 'PRE-FIELD', 'JSON del brief inválido: debe ser un objeto { … }.');
      return;
    }
    let completeness: number | null | undefined = undefined;
    const cs = this.briefCompletenessStr.trim();
    if (cs !== '') {
      const n = Number(cs);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        this.toast.showToast('warn', 'PRE-FIELD', 'Completitud: número entre 0 y 100 o vacío.');
        return;
      }
      completeness = n;
    }
    const cq = this.companyQueryForApi(cid);
    this.briefSaving.set(true);
    this.fieldSvc
      .patchStudyBrief(
        sid,
        {
          payload: parsed,
          completeness_score: completeness === undefined ? undefined : completeness,
        },
        cq
      )
      .subscribe({
        next: b => {
          this.brief.set(b);
          this.briefSaving.set(false);
          this.toast.showToast('success', 'PRE-FIELD', 'Brief actualizado.');
          const open = this.detailRevision()?.id;
          if (open != null) {
            this.reloadReadinessForRevision(open);
          }
          this.cdr.markForCheck();
        },
        error: err => {
          this.briefSaving.set(false);
          const detail = err?.error?.detail;
          const msg =
            typeof detail === 'string'
              ? detail
              : 'No se pudo guardar el brief (¿ya está aprobado?).';
          this.toast.showToast('error', 'PRE-FIELD', msg);
          this.cdr.markForCheck();
        },
      });
  }

  approveBriefInternalUi(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.briefSaving.set(true);
    this.fieldSvc.approveStudyBriefInternal(sid, cq).subscribe({
      next: b => {
        this.brief.set(b);
        this.briefSaving.set(false);
        this.briefPayloadText = JSON.stringify(b.payload_json ?? {}, null, 2);
        this.toast.showToast('success', 'PRE-FIELD', 'Brief aprobado internamente.');
        this.reloadReadinessPolicy();
        const open = this.detailRevision()?.id;
        if (open != null) {
          this.reloadReadinessForRevision(open);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.briefSaving.set(false);
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo registrar la aprobación interna.');
        this.cdr.markForCheck();
      },
    });
  }

  approveBriefClientUi(): void {
    const sid = this.studyId();
    const cid = this.projectCompanyId();
    if (sid == null || cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.briefSaving.set(true);
    this.fieldSvc.approveStudyBriefClient(sid, cq).subscribe({
      next: b => {
        this.brief.set(b);
        this.briefSaving.set(false);
        this.briefPayloadText = JSON.stringify(b.payload_json ?? {}, null, 2);
        this.toast.showToast('success', 'PRE-FIELD', 'Visto bueno cliente registrado.');
        this.reloadReadinessPolicy();
        const open = this.detailRevision()?.id;
        if (open != null) {
          this.reloadReadinessForRevision(open);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.briefSaving.set(false);
        this.toast.showToast(
          'error',
          'PRE-FIELD',
          'No se pudo registrar (¿falta aprobación interna?).'
        );
        this.cdr.markForCheck();
      },
    });
  }

  submitFrameworkWaiver(): void {
    const d = this.detailRevision();
    const cid = this.projectCompanyId();
    if (d == null || cid == null || d.status !== 'draft') {
      return;
    }
    const rationale = this.waiverRationale.trim();
    if (rationale.length < 5) {
      this.toast.showToast('warn', 'PRE-FIELD', 'Indique el motivo del waiver (auditoría).');
      return;
    }
    let waived: unknown[] | Record<string, unknown> | null | undefined = undefined;
    const raw = this.waiverSectionsJson.trim();
    if (raw) {
      try {
        const p = JSON.parse(raw) as unknown;
        if (p !== null && typeof p === 'object') {
          waived = p as unknown[] | Record<string, unknown>;
        } else {
          throw new Error('shape');
        }
      } catch {
        this.toast.showToast('error', 'PRE-FIELD', 'JSON de secciones relevadas inválido.');
        return;
      }
    }
    const cq = this.companyQueryForApi(cid);
    this.waiverSubmitting.set(true);
    this.fieldSvc
      .createFrameworkWaiver(d.id, { rationale, waived_sections: waived ?? null }, cq)
      .subscribe({
        next: () => {
          this.waiverSubmitting.set(false);
          this.waiverRationale = '';
          this.waiverSectionsJson = '';
          this.toast.showToast('success', 'PRE-FIELD', 'Waiver registrado.');
          this.reloadWaiversForRevision(d.id);
          this.reloadReadinessForRevision(d.id);
          this.cdr.markForCheck();
        },
        error: () => {
          this.waiverSubmitting.set(false);
          this.toast.showToast('error', 'PRE-FIELD', 'No se pudo crear el waiver.');
          this.cdr.markForCheck();
        },
      });
  }

  private reloadWaiversForRevision(revisionId: number): void {
    const cid = this.projectCompanyId();
    if (cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.detailWaiversLoading.set(true);
    this.fieldSvc.listFrameworkWaivers(revisionId, cq).subscribe({
      next: rows => {
        this.detailWaivers.set(rows);
        this.detailWaiversLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.detailWaiversLoading.set(false);
        this.detailWaivers.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  private reloadReadinessForRevision(revisionId: number): void {
    const cid = this.projectCompanyId();
    if (cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.fieldSvc.getReadinessForRevision(revisionId, cq).subscribe({
      next: g => {
        this.readinessGate.set(g);
        this.cdr.markForCheck();
      },
      error: () => {
        this.readinessGate.set(null);
        this.cdr.markForCheck();
      },
    });
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
      next: rows => {
        this.revisions.set(rows);
        const open = this.detailRevision()?.id;
        if (open != null && !rows.some(r => r.id === open)) {
          this.detailRevision.set(null);
          this.detailWaivers.set([]);
          this.readinessGate.set(null);
        }
      },
      error: () =>
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudieron cargar las revisiones del instrumento.'),
    });
  }

  toggleRevisionDetail(revisionId: number): void {
    if (this.detailRevision()?.id === revisionId) {
      this.detailRevision.set(null);
      this.detailWaivers.set([]);
      this.readinessGate.set(null);
      return;
    }
    const cid = this.projectCompanyId();
    if (cid == null) {
      return;
    }
    const cq = this.companyQueryForApi(cid);
    this.detailLoading.set(true);
    this.detailRevision.set(null);
    this.detailWaivers.set([]);
    this.readinessGate.set(null);
    this.fieldSvc.getInstrumentRevision(revisionId, cq).subscribe({
      next: row => {
        this.detailRevision.set(row);
        this.detailLoading.set(false);
        this.reloadWaiversForRevision(revisionId);
        this.reloadReadinessForRevision(revisionId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.detailLoading.set(false);
        this.toast.showToast('error', 'PRE-FIELD', 'No se pudo cargar el borrador.');
        this.cdr.markForCheck();
      },
    });
  }

  closeRevisionDetail(): void {
    this.detailRevision.set(null);
    this.detailWaivers.set([]);
    this.readinessGate.set(null);
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
          this.fieldSvc
            .createProject({
              name: pname,
              description: objective.slice(0, 500),
              client_id: clientId,
              company_id: cqBody,
              study_id: study.id,
            })
            .pipe(map(project => ({ study, project })))
        )
      )
      .subscribe({
        next: ({ study, project }) => {
          this.setupSubmitting.set(false);
          this.toast.showToast('success', 'PRE-FIELD', 'Proyecto y estudio creados. Ya puede definir el instrumento.');
          this.router.navigate(['/field/project', project.id, 'pre-field'], {
            queryParams: { ready: '1', study_id: String(study.id) },
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
        const sidFromProject = row.project.study_id ?? null;
        const qpStudyRaw = this.route.snapshot.queryParamMap.get('study_id');
        const qpStudyNum = qpStudyRaw != null ? Number(qpStudyRaw) : NaN;
        const qpStudyOk = Number.isFinite(qpStudyNum) && qpStudyNum > 0;
        const forceInstrument = this.route.snapshot.queryParamMap.get('ready') === '1';
        let sid: number | null = sidFromProject;
        if (forceInstrument && qpStudyOk) {
          sid = qpStudyNum;
        }
        if (sid != null && (this.phase() === 'instrument' || forceInstrument)) {
          if (forceInstrument) {
            this.phase.set('instrument');
          }
          this.studyId.set(sid);
          this.studyTitle.set(row.study_display_name ?? row.project.name);
          this.reloadTemplates();
          this.reloadRevisions();
          this.reloadBrief();
          this.reloadReadinessPolicy();
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
      this.reloadBrief();
      this.reloadReadinessPolicy();
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
