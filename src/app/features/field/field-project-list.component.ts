import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';

import {
  decisionExecutiveLine as decisionExecutiveMessage,
  decisionRiskLine as stakeholderRiskByCode,
} from './field-decision-briefing';
import {
  DoobloCompanyConfig,
  EndClient,
  FieldDecisionFinding,
  FieldFinding,
  FieldImportRun,
  FieldProject,
  FieldProjectExternalSource,
  FieldService,
  FieldSyncRun,
} from './field.service';

/** Texto fijo por código técnico — lo ve el cliente sin leer el backend. */
const FINDING_KIND_LABEL: Record<string, string> = {
  ROW_INCOMPLETE: 'Fila no guardada (faltan datos clave)',
  DUPLICATE_CASE: 'Mismo caso repetido en el archivo',
  INVALID_DURATION: 'Duración del caso a revisar',
  DOOBLO_QUOTA_SNAPSHOT: 'Cuota (SurveyToGo)',
  DOOBLO_QUOTA_UPSTREAM: 'Cuota: error al leer en SurveyToGo',
  DOOBLO_NO_SURVEY_ID: 'Falta ID de encuesta Dooblo',
  QUOTA_MAX_DEVIATION: 'Posible desvío de cuota respecto a política',
};

@Component({
  selector: 'app-field-project-list',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule, RouterLink],
  templateUrl: './field-project-list.component.html',
  styleUrl: './field-project-list.component.css',
})
export class FieldProjectListComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);

  readonly user = this.auth.getCurrentUser();
  readonly projects = signal<FieldProject[]>([]);
  readonly clients = signal<EndClient[]>([]);
  readonly loading = signal(false);
  readonly companies = signal<Company[]>([]);
  readonly selectedCompanyId = signal<number | null>(null);
  readonly selectedClientId = signal<number | null>(null);

  readonly newName = signal('');
  readonly newDescription = signal('');
  /** Origen de datos del proyecto que se va a crear (paso 2). */
  readonly newIngestMode = signal<'csv' | 'dooblo'>('csv');
  readonly newClientName = signal('');

  readonly isSuperAdmin = this.user.role === 0;

  /** Proyecto cuyo panel de resumen está abierto (null = ninguno). */
  readonly summaryProjectId = signal<number | null>(null);
  readonly summaryLoading = signal(false);
  readonly summaryRun = signal<FieldImportRun | null>(null);
  readonly summaryFindings = signal<FieldFinding[]>([]);
  /** Líneas de datos leídas en el CSV (cabecera no cuenta); viene del registro de auditoría. */
  readonly summaryLinesSeen = signal<number | null>(null);

  /** Paso del asistente: 1 cliente, 2 proyecto, 3 cargas y resumen. */
  readonly activeStep = signal<1 | 2 | 3>(1);

  /** Configuración Dooblo/ SurveyToGo de la empresa activa (credenciales por cliente). */
  readonly doobloCompanyContext = signal<DoobloCompanyConfig | null>(null);
  readonly doobloCredentialsLoading = signal(false);
  /** Formulario guardar credenciales API (origen, usuario, contraseña). */
  readonly doobloFormBaseUrl = signal('');
  readonly doobloFormApiUser = signal('');
  readonly doobloFormPassword = signal('');
  /** Contexto del proyecto cuyo resumen está abierto. */
  readonly doobloExternalSources = signal<FieldProjectExternalSource[]>([]);
  readonly doobloSyncRuns = signal<FieldSyncRun[]>([]);
  readonly doobloDecisionFindings = signal<FieldDecisionFinding[]>([]);
  readonly newDoobloStudioProject = signal('');
  readonly newDoobloSurveyId = signal('');
  readonly doobloActionBusy = signal(false);

  /** API company/ limita a 100 (FastAPI le=100). No pedir 200. */
  private static readonly companyListLimit = 100;
  private doobloPollTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.clearDoobloPoll();
  }

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, FieldProjectListComponent.companyListLimit).subscribe({
        next: res => {
          this.companies.set(res.data);
          const first = res.data[0]?.id ?? null;
          this.selectedCompanyId.set(first);
          if (first != null) {
            this.reloadClientsAndProjects();
          }
        },
        error: (err: unknown) => {
          const msg =
            err instanceof HttpErrorResponse && err.status === 422
              ? 'Parámetros no válidos al listar empresas (límite o offset).'
              : 'No se pudieron cargar empresas. Compruebe sesión y API.';
          this.toast.showToast('error', 'Field', msg);
        },
      });
    } else {
      this.selectedCompanyId.set(this.user.company_id ?? null);
      this.reloadClientsAndProjects();
    }
  }

  /** Carga orígenes SurveyToGo para la empresa actual (cada cliente puede usar sus claves). */
  private loadFieldDoobloCompanyContext(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      this.doobloCompanyContext.set(null);
      return;
    }
    this.doobloCredentialsLoading.set(true);
    this.fieldSvc.getDoobloContext(cid).subscribe({
      next: c => {
        this.doobloCompanyContext.set(c);
        this.doobloFormBaseUrl.set(c.base_url || '');
        this.doobloFormApiUser.set(c.api_user || '');
        this.doobloFormPassword.set('');
        this.doobloCredentialsLoading.set(false);
      },
      error: () => {
        this.doobloCompanyContext.set(null);
        this.doobloCredentialsLoading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudo cargar la configuración Dooblo.');
      },
    });
  }

  saveDoobloCompanyCredentials(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    const base = this.doobloFormBaseUrl().trim();
    const user = this.doobloFormApiUser().trim();
    const pass = this.doobloFormPassword().trim();
    if (!user) {
      this.toast.showToast('warn', 'Field', 'Indique el usuario o REST_KEY de la API Dooblo.');
      return;
    }
    if (!pass && !this.doobloCompanyContext()?.has_password) {
      this.toast.showToast('warn', 'Field', 'Indique la contraseña o clave de la API (primera vez).');
      return;
    }
    this.doobloActionBusy.set(true);
    this.fieldSvc
      .putDoobloCredentials(cid, {
        base_url: base || null,
        api_user: user,
        password: pass || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.showToast('success', 'Field', 'Credenciales Dooblo guardadas para esta empresa.');
          this.loadFieldDoobloCompanyContext();
          this.doobloActionBusy.set(false);
        },
        error: (err: unknown) => {
          this.doobloActionBusy.set(false);
          this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudieron guardar las credenciales.'));
        },
      });
  }

  effectiveCompanyId(): number | null {
    return this.selectedCompanyId();
  }

  /** Proyecto en tabla declara encuesta por API; condiciona el tablero. */
  isDoobloIngest(project: { ingest_mode?: string }): boolean {
    return (project.ingest_mode ?? 'csv') === 'dooblo';
  }

  /** Hay al menos un proyecto Dooblo: el paso 3 prioriza credenciales API. */
  anyProjectDooblo(): boolean {
    return this.projects().some(p => (p.ingest_mode ?? 'csv') === 'dooblo');
  }

  doobloCredentialsPanelClass(): string {
    const base =
      'mb-6 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-600/50 dark:bg-slate-800/30';
    if (this.anyProjectDooblo()) {
      return `${base} ring-2 ring-indigo-400/50 dark:ring-indigo-500/40`;
    }
    return base;
  }

  doobloSummaryPanelClass(project: { ingest_mode?: string }): string {
    const base =
      'rounded-xl border border-violet-200/80 bg-violet-50/40 p-4 dark:border-violet-900/50 dark:bg-violet-950/20';
    if (this.isDoobloIngest(project)) {
      return `${base} ring-2 ring-violet-300/50 dark:ring-violet-600/40`;
    }
    return base;
  }

  onCompanySelect(ev: Event): void {
    const v = Number((ev.target as HTMLSelectElement).value);
    if (Number.isFinite(v) && v > 0) {
      this.selectedCompanyId.set(v);
      this.selectedClientId.set(null);
      this.closeImportSummary();
      this.reloadClientsAndProjects();
    }
  }

  onClientSelect(ev: Event): void {
    const v = Number((ev.target as HTMLSelectElement).value);
    if (Number.isFinite(v) && v > 0) {
      this.selectedClientId.set(v);
    } else {
      this.selectedClientId.set(null);
    }
  }

  reloadClientsAndProjects(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    this.fieldSvc.listEndClients(cid).subscribe({
      next: rows => {
        this.clients.set(rows);
        const first = rows[0]?.id ?? null;
        this.selectedClientId.set(first);
        this.reloadProjects();
        this.loadFieldDoobloCompanyContext();
      },
      error: () =>
        this.toast.showToast('error', 'Field', 'No se pudieron cargar clientes finales.'),
    });
  }

  reloadProjects(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    this.loading.set(true);
    this.fieldSvc.listProjects(cid, null).subscribe({
      next: rows => {
        this.projects.set(rows);
        this.loading.set(false);
        const open = this.summaryProjectId();
        if (open != null && !rows.some(p => p.id === open)) {
          this.closeImportSummary();
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudieron cargar proyectos.');
      },
    });
  }

  closeImportSummary(): void {
    this.clearDoobloPoll();
    this.summaryProjectId.set(null);
    this.summaryRun.set(null);
    this.summaryFindings.set([]);
    this.summaryLinesSeen.set(null);
    this.summaryLoading.set(false);
    this.doobloExternalSources.set([]);
    this.doobloSyncRuns.set([]);
    this.doobloDecisionFindings.set([]);
    this.newDoobloStudioProject.set('');
    this.newDoobloSurveyId.set('');
  }

  toggleImportSummary(projectId: number): void {
    if (this.summaryProjectId() === projectId) {
      this.closeImportSummary();
      return;
    }
    this.summaryProjectId.set(projectId);
    this.loadImportSummary(projectId);
  }

  summaryOpenFor(projectId: number): boolean {
    return this.summaryProjectId() === projectId;
  }

  loadImportSummary(projectId: number): void {
    this.summaryLoading.set(true);
    this.summaryRun.set(null);
    this.summaryFindings.set([]);
    this.summaryLinesSeen.set(null);
    this.doobloExternalSources.set([]);
    this.doobloSyncRuns.set([]);
    this.doobloDecisionFindings.set([]);

    this.fieldSvc.listImportRuns(projectId, 15).subscribe({
      next: runs => {
        const run = runs[0] ?? null;
        if (!run) {
          this.summaryLoading.set(false);
          this.loadDoobloContextOnly(projectId, () => {
            this.summaryLoading.set(false);
          });
          return;
        }
        this.summaryRun.set(run);
        forkJoin({
          findings: this.fieldSvc.listImportRunFindings(projectId, run.id),
          ledger: this.fieldSvc.listLedgerEvents(projectId, 80),
        }).subscribe({
          next: ({ findings, ledger }) => {
            this.summaryFindings.set(findings);
            const done = ledger.find(
              e =>
                e.event_type === 'import_completed' &&
                e.field_import_run_id === run.id
            );
            const raw = done?.payload?.['data_lines_seen'];
            this.summaryLinesSeen.set(typeof raw === 'number' ? raw : null);
            this.loadDoobloContextOnly(projectId, () => {
              this.summaryLoading.set(false);
            });
          },
          error: () => {
            this.loadDoobloContextOnly(projectId, () => {
              this.summaryLoading.set(false);
            });
            this.toast.showToast('error', 'Field', 'No se pudo cargar el resumen de la última importación.');
          },
        });
      },
      error: () => {
        this.loadDoobloContextOnly(projectId, () => {
          this.summaryLoading.set(false);
        });
        this.toast.showToast('error', 'Field', 'No se pudieron leer las importaciones del proyecto.');
      },
    });
  }

  /** Carga mapeo Dooblo, corridas y hallazgos de análisis (no bloquea el mensaje de error CSV). */
  private loadDoobloContextOnly(
    projectId: number,
    done: () => void
  ): void {
    forkJoin({
      src: this.fieldSvc.listExternalSources(projectId).pipe(
        catchError(() => of([] as FieldProjectExternalSource[]))
      ),
      runs: this.fieldSvc.listSyncRuns(projectId, 20).pipe(
        catchError(() => of([] as FieldSyncRun[]))
      ),
      find: this.fieldSvc.listDecisionLayerFindings(projectId, 'dooblo_analysis', 50).pipe(
        catchError(() => of([] as FieldDecisionFinding[]))
      ),
    }).subscribe({
      next: ({ src, runs, find }) => {
        this.doobloExternalSources.set(src);
        this.doobloSyncRuns.set(runs);
        this.doobloDecisionFindings.set(find);
        done();
      },
      error: () => {
        done();
      },
    });
  }

  doobloSources(): FieldProjectExternalSource[] {
    return this.doobloExternalSources().filter(s => s.source_type === 'dooblo' && s.is_active);
  }

  lastDoobloFieldAnalysisRun(): FieldSyncRun | null {
    return this.doobloSyncRuns().find(r => r.run_kind === 'field_analysis') ?? null;
  }

  doobloRunLabel(run: FieldSyncRun | null): string {
    if (!run) {
      return 'Aún no hay análisis Dooblo en este proyecto.';
    }
    switch (run.status) {
      case 'completed':
        return 'Último análisis Dooblo: completado';
      case 'failed':
        return 'Último análisis Dooblo: falló';
      case 'processing':
        return 'Analizando con SurveyToGo…';
      case 'pending':
        return 'Análisis Dooblo en cola…';
      default:
        return `Estado: ${run.status}`;
    }
  }

  saveDoobloSource(projectId: number): void {
    const survey = this.newDoobloSurveyId().trim();
    if (!survey) {
      this.toast.showToast('warn', 'Field', 'Indique el ID de encuesta en SurveyToGo/Dooblo.');
      return;
    }
    const extProj = this.newDoobloStudioProject().trim() || null;
    this.doobloActionBusy.set(true);
    this.fieldSvc
      .createExternalSource(projectId, {
        source_type: 'dooblo',
        external_survey_id: survey,
        external_project_id: extProj,
        is_active: true,
      })
      .subscribe({
        next: () => {
          this.newDoobloStudioProject.set('');
          this.newDoobloSurveyId.set('');
          this.toast.showToast('success', 'Field', 'Vínculo Dooblo guardado.');
          this.loadDoobloContextOnly(projectId, () => {
            this.doobloActionBusy.set(false);
          });
        },
        error: (err: unknown) => {
          this.doobloActionBusy.set(false);
          this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudo guardar el vínculo Dooblo.'));
        },
      });
  }

  runDoobloAnalysis(projectId: number): void {
    const ikey = `field-dooblo-${projectId}-${Date.now()}`;
    const first = this.doobloSources()[0];
    this.doobloActionBusy.set(true);
    this.fieldSvc
      .postDoobloAnalyze(projectId, {
        idempotency_key: ikey,
        field_project_external_source_id: first?.id ?? null,
      })
      .subscribe({
        next: run => {
          this.toast.showToast('success', 'Field', 'Análisis Dooblo encolado.');
          this.loadDoobloContextOnly(projectId, () => {
            this.doobloActionBusy.set(false);
            this.scheduleDoobloPoll(projectId, run.id);
          });
        },
        error: (err: unknown) => {
          this.doobloActionBusy.set(false);
          this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudo encolar el análisis Dooblo.'));
        },
      });
  }

  private httpErrorDetail(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const b = err.error;
      if (b && typeof b === 'object' && 'detail' in b && b['detail'] != null) {
        return String(b['detail']);
      }
    }
    return fallback;
  }

  private clearDoobloPoll(): void {
    if (this.doobloPollTimer != null) {
      clearTimeout(this.doobloPollTimer);
      this.doobloPollTimer = null;
    }
  }

  /** Refresca estado hasta que la corrida termine o alcanzamos reintentos. */
  private scheduleDoobloPoll(projectId: number, syncRunId: number, attempt = 0): void {
    this.clearDoobloPoll();
    if (attempt > 30) {
      return;
    }
    this.doobloPollTimer = setTimeout(() => {
      this.fieldSvc.listSyncRuns(projectId, 15).subscribe({
        next: runs => {
          this.doobloSyncRuns.set(runs);
          const r = runs.find(x => x.id === syncRunId);
          this.fieldSvc
            .listDecisionLayerFindings(projectId, 'dooblo_analysis', 50)
            .pipe(catchError(() => of([] as FieldDecisionFinding[])))
            .subscribe(f => this.doobloDecisionFindings.set(f));
          if (r == null) {
            this.scheduleDoobloPoll(projectId, syncRunId, attempt + 1);
            return;
          }
          if (r.status === 'pending' || r.status === 'processing') {
            this.scheduleDoobloPoll(projectId, syncRunId, attempt + 1);
          }
        },
        error: () => this.scheduleDoobloPoll(projectId, syncRunId, attempt + 1),
      });
    }, 1500);
  }

  doobloFindingKindLabel(code: string): string {
    return FINDING_KIND_LABEL[code] ?? 'Señal de la capa de decisión (Dooblo)';
  }

  doobloSourceLabel(): string {
    const s = this.doobloCompanyContext()?.source;
    if (s === 'company') {
      return 'Claves propias (guardadas en Siete para esta empresa).';
    }
    if (s === 'env') {
      return 'Usando credenciales globales del servidor (p. ej. variables en Railway).';
    }
    return 'Sin conexión configurada: guarde credenciales aquí o pida las variables en el hosting.';
  }

  /** Título corto del estado de la corrida (lenguaje natural). */
  runOutcomeLabel(run: FieldImportRun): string {
    switch (run.status) {
      case 'completed':
        return 'Archivo procesado correctamente';
      case 'failed':
        return 'El archivo no pudo procesarse';
      case 'processing':
        return 'Procesando…';
      default:
        return run.status;
    }
  }

  findingKindLabel(code: string): string {
    return FINDING_KIND_LABEL[code] ?? 'Aviso de calidad de datos';
  }

  /** Riesgo para dirección/operación, por código (copy fijo, no reemplaza el mensaje técnico). */
  decisionRiskLine(finding: FieldFinding): string {
    return stakeholderRiskByCode(finding.code);
  }

  /** Frase de resumen bajo lente de plazo, coste de corrección o defensa del levantamiento. */
  decisionExecutiveLine(): string | null {
    return decisionExecutiveMessage(this.summaryRun(), this.summaryFindings());
  }

  severityPlain(sev: string): string {
    if (sev === 'error') {
      return 'Requiere acción';
    }
    if (sev === 'warn') {
      return 'Conviene revisar';
    }
    if (sev === 'info') {
      return 'Informativo';
    }
    return sev;
  }

  findingsErrorCount(): number {
    return this.summaryFindings().filter(f => f.severity === 'error').length;
  }

  findingsWarnCount(): number {
    return this.summaryFindings().filter(f => f.severity === 'warn').length;
  }

  clientDisplayName(clientId: number): string {
    return this.clients().find(c => c.id === clientId)?.name ?? `Cliente #${clientId}`;
  }

  /** Borde/fondo del panel de resumen según resultado (lectura rápida). */
  goStep(step: number): void {
    if (step === 1 || step === 2 || step === 3) {
      this.activeStep.set(step as 1 | 2 | 3);
    }
  }

  nextStep(): void {
    const s = this.activeStep();
    if (s < 3) {
      this.activeStep.set((s + 1) as 1 | 2 | 3);
    }
  }

  prevStep(): void {
    const s = this.activeStep();
    if (s > 1) {
      this.activeStep.set((s - 1) as 1 | 2 | 3);
    }
  }

  stepShortLabel(step: number): string {
    switch (step) {
      case 1:
        return 'Cliente';
      case 2:
        return 'Proyecto';
      case 3:
        return 'Carga e integración';
      default:
        return '';
    }
  }

  stepNavButtonClass(step: number): Record<string, boolean> {
    const on = this.activeStep() === step;
    return {
      'field-step-btn flex min-w-0 items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition': true,
      'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm dark:border-indigo-500/80 dark:bg-indigo-950/50 dark:text-indigo-100':
        on,
      'border-slate-200/90 bg-slate-50/80 text-slate-700 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-200':
        !on,
    };
  }

  stepNavCircleClass(step: number): Record<string, boolean> {
    const on = this.activeStep() === step;
    return {
      'field-step-num flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold': true,
      'bg-indigo-600 text-white shadow-md dark:bg-indigo-500': on,
      'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-100': !on,
    };
  }

  importHealthShellClass(): string {
    const base = 'rounded-lg border p-4 shadow-sm ';
    const run = this.summaryRun();
    if (!run) {
      return base + 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900/40';
    }
    if (run.status === 'failed') {
      return base + 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30';
    }
    if (this.findingsErrorCount() > 0) {
      return base + 'border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/25';
    }
    if (this.findingsWarnCount() > 0) {
      return base + 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/25';
    }
    return base + 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/25';
  }

  createClient(): void {
    const cid = this.effectiveCompanyId();
    const name = this.newClientName().trim();
    if (cid == null || !name) {
      return;
    }
    const body: { name: string; company_id?: number } = { name };
    if (this.isSuperAdmin) {
      body.company_id = cid;
    }
    this.fieldSvc.createEndClient(body).subscribe({
      next: () => {
        this.newClientName.set('');
        this.toast.showToast('success', 'Field', 'Cliente final creado.');
        this.reloadClientsAndProjects();
        this.activeStep.set(2);
      },
      error: () =>
        this.toast.showToast('error', 'Field', 'No se pudo crear el cliente.'),
    });
  }

  createProject(): void {
    const cid = this.effectiveCompanyId();
    const clientId = this.selectedClientId();
    const name = this.newName().trim();
    if (cid == null || clientId == null || !name) {
      this.toast.showToast('warn', 'Field', 'Nombre y cliente final son obligatorios.');
      return;
    }
    const body = {
      name,
      description: this.newDescription().trim() || null,
      client_id: clientId,
      company_id: this.isSuperAdmin ? cid : undefined,
      ingest_mode: this.newIngestMode(),
    };
    this.fieldSvc.createProject(body).subscribe({
      next: () => {
        this.newName.set('');
        this.newDescription.set('');
        this.newIngestMode.set('csv');
        this.toast.showToast('success', 'Field', 'Proyecto creado.');
        this.reloadProjects();
        this.activeStep.set(3);
      },
      error: () =>
        this.toast.showToast('error', 'Field', 'No se pudo crear el proyecto.'),
    });
  }

  onImport(projectId: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.fieldSvc.importCsv(projectId, file).subscribe({
      next: run => {
        input.value = '';
        if (run.status === 'completed') {
          this.toast.showToast(
            'success',
            'Importación',
            `Listo: ${run.row_count ?? 0} caso(s) guardados en el sistema.`
          );
        } else {
          this.toast.showToast(
            'error',
            'Importación',
            run.error_detail ?? 'Falló la validación del CSV.'
          );
        }
        if (this.summaryProjectId() === projectId) {
          this.loadImportSummary(projectId);
        }
      },
      error: () => {
        input.value = '';
        this.toast.showToast('error', 'Importación', 'Error al subir el archivo.');
      },
    });
  }
}
