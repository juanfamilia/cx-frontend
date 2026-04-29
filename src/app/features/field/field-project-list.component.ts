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
  FieldFinding,
  FieldFindingDecisionLog,
  FieldImportRun,
  FieldProject,
  FieldProjectExternalSource,
  FieldService,
  FieldStudy,
  FieldSyncRun,
  RemoteFieldCatalogPage,
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
  /** Estudios del cliente actual (selector paso 2). */
  readonly studies = signal<FieldStudy[]>([]);
  /** Todos los estudios de la empresa (para etiquetas en la tabla multi-cliente). */
  readonly studyCatalog = signal<FieldStudy[]>([]);
  readonly clients = signal<EndClient[]>([]);
  readonly loading = signal(false);
  readonly companies = signal<Company[]>([]);
  readonly selectedCompanyId = signal<number | null>(null);
  readonly selectedClientId = signal<number | null>(null);

  readonly newName = signal('');
  readonly newDescription = signal('');
  /** Origen de datos del proyecto (paso 3 del asistente). */
  readonly newIngestMode = signal<'csv' | 'dooblo'>('csv');
  readonly newClientName = signal('');
  readonly newStudyName = signal('');
  readonly newStudyDescription = signal('');
  /** Estudio vinculado al proyecto nuevo (opcional). */
  readonly selectedStudyId = signal<number | null>(null);

  readonly isSuperAdmin = this.user.role === 0;

  /** Proyecto cuyo panel de resumen está abierto (null = ninguno). */
  readonly summaryProjectId = signal<number | null>(null);
  readonly summaryLoading = signal(false);
  readonly summaryRun = signal<FieldImportRun | null>(null);
  readonly summaryFindings = signal<FieldFinding[]>([]);
  /** Líneas de datos leídas en el CSV (cabecera no cuenta); viene del registro de auditoría. */
  readonly summaryLinesSeen = signal<number | null>(null);

  /** Asistente: 1 cliente → 2 estudio → 3 proyecto → 4 carga y resumen. */
  readonly activeStep = signal<1 | 2 | 3 | 4>(1);

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
  readonly doobloDecisionFindings = signal<FieldFinding[]>([]);
  readonly newDoobloStudioProject = signal('');
  /** Nota opcional en auditoría al cambiar estado (clave = id de hallazgo). */
  readonly decisionNoteByFindingId = signal<Record<string, string>>({});
  readonly decisionLogFindingId = signal<number | null>(null);
  readonly decisionLogItems = signal<FieldFindingDecisionLog[]>([]);
  readonly decisionLogLoading = signal(false);
  readonly patchingFindingId = signal<number | null>(null);
  readonly patchingProjectStudyId = signal<number | null>(null);
  /** Hallazgo activo en el panel único de decisión / nota / historial. */
  readonly decisionFocusFindingId = signal<number | null>(null);
  readonly newDoobloSurveyId = signal('');
  readonly doobloActionBusy = signal(false);

  /** Customer SurveyToGo (CustomerProjects / ProjectSurveys encadenan desde aquí). */
  readonly doobloSurveyToGoCustomerId = signal('');
  readonly doobloCustomersCatalog = signal<RemoteFieldCatalogPage | null>(null);
  readonly doobloCustomersCatalogBusy = signal(false);
  readonly doobloCustomersCatalogQ = signal('');

  /** Catálogo org-wide: proyectos Studio (Customers × CustomerProjects). */
  readonly doobloOrgStudioProjectsCatalog = signal<RemoteFieldCatalogPage | null>(null);
  readonly doobloOrgStudioProjectsCatalogBusy = signal(false);
  readonly doobloOrgStudioProjectsCatalogQ = signal('');

  /** Picker CustomerProjects (lista paginada + búsqueda). */
  readonly doobloCustomerProjectsCatalog = signal<RemoteFieldCatalogPage | null>(null);
  readonly doobloCustomerProjectsCatalogBusy = signal(false);
  readonly doobloCustomerProjectsCatalogQ = signal('');

  /** Picker ProjectSurveys (requiere Project Studio ID). */
  readonly doobloProjectSurveysCatalog = signal<RemoteFieldCatalogPage | null>(null);
  readonly doobloProjectSurveysCatalogBusy = signal(false);
  readonly doobloProjectSurveysCatalogQ = signal('');

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
      this.selectedStudyId.set(null);
      this.reloadStudies();
    } else {
      this.selectedClientId.set(null);
      this.studies.set([]);
      this.selectedStudyId.set(null);
    }
  }

  reloadStudies(): void {
    const cid = this.effectiveCompanyId();
    const clientId = this.selectedClientId();
    if (cid == null || clientId == null) {
      this.studies.set([]);
      return;
    }
    this.fieldSvc.listStudies(cid, clientId).subscribe({
      next: rows => {
        this.studies.set(rows);
        const cur = this.selectedStudyId();
        if (cur != null && !rows.some(s => s.id === cur)) {
          this.selectedStudyId.set(null);
        }
      },
      error: () => {
        this.studies.set([]);
        this.toast.showToast('warn', 'Field', 'No se pudieron cargar los estudios.');
      },
    });
  }

  /** Catálogo empresa para mostrar nombres cuando la tabla mezcla varios clientes. */
  reloadStudyCatalog(): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      this.studyCatalog.set([]);
      return;
    }
    this.fieldSvc.listStudies(cid, null).subscribe({
      next: rows => this.studyCatalog.set(rows),
      error: () => this.studyCatalog.set([]),
    });
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
        this.reloadStudies();
        this.reloadStudyCatalog();
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
        this.reloadStudyCatalog();
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
    this.doobloCustomerProjectsCatalog.set(null);
    this.doobloCustomerProjectsCatalogBusy.set(false);
    this.doobloCustomerProjectsCatalogQ.set('');
    this.doobloSurveyToGoCustomerId.set('');
    this.doobloCustomersCatalog.set(null);
    this.doobloCustomersCatalogBusy.set(false);
    this.doobloCustomersCatalogQ.set('');
    this.doobloProjectSurveysCatalog.set(null);
    this.doobloProjectSurveysCatalogBusy.set(false);
    this.doobloProjectSurveysCatalogQ.set('');
    this.decisionNoteByFindingId.set({});
    this.decisionLogFindingId.set(null);
    this.decisionLogItems.set([]);
    this.decisionLogLoading.set(false);
    this.patchingFindingId.set(null);
    this.decisionFocusFindingId.set(null);
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
        catchError(() => of([] as FieldFinding[]))
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

  /** Proyectos Studio de todos los clientes visibles para el usuario API (típico en MR). */
  fetchDoobloOrganizationStudioProjectsCatalog(page: number): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    if (!this.doobloCompanyContext()?.configured) {
      this.toast.showToast('warn', 'Field', 'Configure primero las credenciales Dooblo.');
      return;
    }
    this.doobloOrgStudioProjectsCatalogBusy.set(true);
    const q = this.doobloOrgStudioProjectsCatalogQ().trim();
    this.fieldSvc
      .listDoobloOrganizationStudioProjectsCatalog(cid, {
        page,
        page_size: 25,
        q: q || undefined,
      })
      .subscribe({
        next: data => {
          this.doobloOrgStudioProjectsCatalog.set(data);
          this.doobloOrgStudioProjectsCatalogBusy.set(false);
        },
        error: (err: unknown) => {
          this.doobloOrgStudioProjectsCatalogBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron listar los proyectos de la organización en SurveyToGo.')
          );
        },
      });
  }

  /** Catálogo Customers (SurveyToGo); opcionalmente use «Usar cliente» para rellenar Customer ID. */
  fetchDoobloCustomersCatalog(page: number): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    if (!this.doobloCompanyContext()?.configured) {
      this.toast.showToast('warn', 'Field', 'Configure primero las credenciales Dooblo.');
      return;
    }
    this.doobloCustomersCatalogBusy.set(true);
    const q = this.doobloCustomersCatalogQ().trim();
    this.fieldSvc
      .listDoobloCustomersCatalog(cid, {
        page,
        page_size: 25,
        q: q || undefined,
      })
      .subscribe({
        next: data => {
          this.doobloCustomersCatalog.set(data);
          this.doobloCustomersCatalogBusy.set(false);
        },
        error: (err: unknown) => {
          this.doobloCustomersCatalogBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron listar clientes en SurveyToGo.')
          );
        },
      });
  }

  applyDoobloCatalogCustomer(externalId: string): void {
    this.doobloSurveyToGoCustomerId.set(externalId);
    this.doobloCustomerProjectsCatalog.set(null);
    this.doobloCustomerProjectsCatalogQ.set('');
  }

  /** Error habitual: pegar correo o usuario REST API completo en el campo Customer ID. */
  private looksLikeStandaloneEmailAsCustomerId(raw: string): boolean {
    const t = raw.trim();
    if (t.includes('/')) {
      return false;
    }
    if (!t.includes('@')) {
      return false;
    }
    const i = t.indexOf('@');
    const domain = t.slice(i + 1);
    return domain.includes('.');
  }

  /** Formato SurveyToGo: REST_API_KEY/usuario — va en credenciales, no en Customer ID. */
  private looksLikeRestApiUsernameAsCustomerId(raw: string): boolean {
    const t = raw.trim();
    const slash = t.indexOf('/');
    if (slash <= 0) {
      return false;
    }
    const left = t.slice(0, slash).trim();
    const right = t.slice(slash + 1).trim();
    return left.includes('-') && left.length >= 12 && right.length > 0;
  }

  /** Catálogo CustomerProjects para el Customer ID indicado (SurveyToGo). */
  fetchDoobloCustomerProjectsCatalog(page: number): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    const customerId = this.doobloSurveyToGoCustomerId().trim();
    if (!customerId) {
      this.toast.showToast(
        'warn',
        'Field',
        'Indique el Customer ID de SurveyToGo (manual o «Usar cliente» en la tabla de clientes).'
      );
      return;
    }
    if (this.looksLikeRestApiUsernameAsCustomerId(customerId)) {
      this.toast.showToast(
        'warn',
        'Field',
        'Eso parece el usuario API completo (REST_API_KEY/usuario). Va en «Usuario / REST key» arriba, guardado en credenciales. Aquí solo el Customer ID del cliente en SurveyToGo.'
      );
      return;
    }
    if (this.looksLikeStandaloneEmailAsCustomerId(customerId)) {
      this.toast.showToast(
        'warn',
        'Field',
        'Eso parece solo un correo. Customer ID es el identificador del cliente en SurveyToGo (lista «Cargar clientes»), no el email.'
      );
      return;
    }
    if (!this.doobloCompanyContext()?.configured) {
      this.toast.showToast('warn', 'Field', 'Configure primero las credenciales Dooblo.');
      return;
    }
    this.doobloCustomerProjectsCatalogBusy.set(true);
    const q = this.doobloCustomerProjectsCatalogQ().trim();
    this.fieldSvc
      .listDoobloCustomerProjectsCatalog(cid, customerId, {
        page,
        page_size: 25,
        q: q || undefined,
      })
      .subscribe({
        next: data => {
          this.doobloCustomerProjectsCatalog.set(data);
          this.doobloCustomerProjectsCatalogBusy.set(false);
        },
        error: (err: unknown) => {
          this.doobloCustomerProjectsCatalogBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudo listar proyectos en SurveyToGo.')
          );
        },
      });
  }

  applyDoobloCatalogStudioProject(externalId: string, studioCustomerId?: string | null): void {
    this.newDoobloStudioProject.set(externalId);
    const sid = studioCustomerId?.trim();
    if (sid) {
      this.doobloSurveyToGoCustomerId.set(sid);
    }
    this.doobloProjectSurveysCatalog.set(null);
    this.doobloProjectSurveysCatalogQ.set('');
  }

  /** Catálogo ProjectSurveys para el Project Studio indicado en «Proyecto Studio». */
  fetchDoobloProjectSurveysCatalog(page: number): void {
    const cid = this.effectiveCompanyId();
    if (cid == null) {
      return;
    }
    const projectId = this.newDoobloStudioProject().trim();
    if (!projectId) {
      this.toast.showToast(
        'warn',
        'Field',
        'Indique primero el ID de proyecto Studio (manual o «Usar proyecto» arriba).'
      );
      return;
    }
    if (!this.doobloCompanyContext()?.configured) {
      this.toast.showToast('warn', 'Field', 'Configure primero las credenciales Dooblo.');
      return;
    }
    this.doobloProjectSurveysCatalogBusy.set(true);
    const q = this.doobloProjectSurveysCatalogQ().trim();
    this.fieldSvc
      .listDoobloProjectSurveysCatalog(cid, projectId, {
        page,
        page_size: 25,
        q: q || undefined,
      })
      .subscribe({
        next: data => {
          this.doobloProjectSurveysCatalog.set(data);
          this.doobloProjectSurveysCatalogBusy.set(false);
        },
        error: (err: unknown) => {
          this.doobloProjectSurveysCatalogBusy.set(false);
          this.toast.showToast(
            'error',
            'Field',
            this.httpErrorDetail(err, 'No se pudieron listar las encuestas del proyecto en SurveyToGo.')
          );
        },
      });
  }

  applyDoobloCatalogSurveyId(externalId: string): void {
    this.newDoobloSurveyId.set(externalId);
  }

  doobloCatalogTotalPages(cat: RemoteFieldCatalogPage): number {
    if (cat.total <= 0 || cat.page_size <= 0) {
      return 1;
    }
    return Math.ceil(cat.total / cat.page_size);
  }

  /** Filas org-wide pueden incluir cliente SurveyToGo (merge Customers × CustomerProjects). */
  doobloOrgCatalogHasCustomerInfo(cat: RemoteFieldCatalogPage): boolean {
    return cat.items.some(
      r => !!(r.studio_customer_id?.trim() || r.studio_customer_name?.trim())
    );
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
            .pipe(catchError(() => of([] as FieldFinding[])))
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

  /** Título corto en el panel de decisión según origen del hallazgo. */
  decisionPanelKindLabel(f: FieldFinding): string {
    if ((f.source || '').toLowerCase() === 'dooblo_analysis') {
      return this.doobloFindingKindLabel(f.code);
    }
    return this.findingKindLabel(f.code);
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

  /** Etiqueta corta del estudio enlazado al proyecto (tabla). */
  studyLabel(project: FieldProject): string {
    const sid = project.study_id;
    if (sid == null) {
      return '—';
    }
    const s =
      this.studyCatalog().find(x => x.id === sid) ??
      this.studies().find(x => x.id === sid);
    return s ? s.name : `#${sid}`;
  }

  studiesForClient(clientId: number): FieldStudy[] {
    return this.studyCatalog().filter(s => s.client_id === clientId);
  }

  patchProjectStudy(project: FieldProject, studyId: number | null): void {
    const prev = project.study_id ?? null;
    if (prev === studyId) {
      return;
    }
    this.patchingProjectStudyId.set(project.id);
    this.fieldSvc.patchProject(project.id, { study_id: studyId }).subscribe({
      next: updated => {
        this.projects.update(list =>
          list.map(x => (x.id === project.id ? { ...x, ...updated } : x))
        );
        this.reloadStudyCatalog();
        this.patchingProjectStudyId.set(null);
        this.toast.showToast('success', 'Field', 'Estudio del proyecto actualizado.');
      },
      error: (err: unknown) => {
        this.patchingProjectStudyId.set(null);
        this.toast.showToast(
          'error',
          'Field',
          this.httpErrorDetail(err, 'No se pudo actualizar el vínculo al estudio.')
        );
      },
    });
  }

  /** Borde/fondo del panel de resumen según resultado (lectura rápida). */
  goStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.activeStep.set(step as 1 | 2 | 3 | 4);
      if (step === 2) {
        this.reloadStudies();
      }
      if (step === 4) {
        this.reloadProjects();
      }
    }
  }

  nextStep(): void {
    const s = this.activeStep();
    if (s < 4) {
      const next = (s + 1) as 1 | 2 | 3 | 4;
      this.activeStep.set(next);
      if (next === 2) {
        this.reloadStudies();
      }
      if (next === 4) {
        this.reloadProjects();
      }
    }
  }

  prevStep(): void {
    const s = this.activeStep();
    if (s > 1) {
      this.activeStep.set((s - 1) as 1 | 2 | 3 | 4);
    }
  }

  /** Paso ya completado en la línea temporal del asistente. */
  isStepCompleted(step: number): boolean {
    return this.activeStep() > step;
  }

  /** Una línea de foco por pantalla (patrón tipo wizard). */
  wizardInstruction(): string {
    switch (this.activeStep()) {
      case 1:
        return 'Elija el cliente final del levantamiento (o cree uno nuevo).';
      case 2:
        return 'Opcional: puede elegir o crear un «estudio» para agrupar el proyecto bajo un mismo nombre. También puede saltar este paso.';
      case 3:
        return 'Ponga nombre al proyecto y diga si los datos vendrán de un CSV o de SurveyToGo / Dooblo.';
      case 4:
        return 'Aquí carga archivos, conecta SurveyToGo con usuario y clave, y revisa el estado de cada proyecto.';
      default:
        return '';
    }
  }

  stepShortLabel(step: number): string {
    switch (step) {
      case 1:
        return 'Cliente';
      case 2:
        return 'Estudio';
      case 3:
        return 'Proyecto';
      case 4:
        return 'Carga';
      default:
        return '';
    }
  }

  stepWizardStepBtnClass(step: number): Record<string, boolean> {
    const cur = this.activeStep();
    const done = cur > step;
    const on = cur === step;
    return {
      'field-wizard-step-btn group flex min-w-0 flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-2 text-center transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-left':
        true,
      'field-wizard-step-btn--current border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-50':
        on,
      'field-wizard-step-btn--done border-emerald-300 bg-white text-emerald-900 dark:border-emerald-700/80 dark:bg-emerald-950/25 dark:text-emerald-100':
        done && !on,
      'field-wizard-step-btn--todo border-slate-200/90 bg-slate-50/80 text-slate-500 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-400':
        !on && !done,
    };
  }

  stepWizardCircleClass(step: number): Record<string, boolean> {
    const cur = this.activeStep();
    const done = cur > step;
    const on = cur === step;
    return {
      'field-wizard-circle flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition':
        true,
      'bg-emerald-600 text-white shadow dark:bg-emerald-500': done,
      'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400/50 dark:bg-emerald-600': on && !done,
      'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200': !on && !done,
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

  getDecisionNote(findingId: number): string {
    return this.decisionNoteByFindingId()[String(findingId)] ?? '';
  }

  setDecisionNote(findingId: number, value: string): void {
    const k = String(findingId);
    this.decisionNoteByFindingId.update(m => ({ ...m, [k]: value }));
  }

  /** Etiqueta breve del estado de gobernanza (auditoría). */
  approvalStatusLabel(status: string | null | undefined): string {
    if (status == null || status === '') {
      return 'Sin decisión';
    }
    if (status === 'approved') {
      return 'Aprobado';
    }
    if (status === 'rejected') {
      return 'Rechazado';
    }
    if (status === 'pending') {
      return 'Pendiente';
    }
    return status;
  }

  logTransitionText(entry: FieldFindingDecisionLog): string {
    const from = entry.from_status == null || entry.from_status === '' ? '—' : this.approvalStatusLabel(entry.from_status);
    const to = this.approvalStatusLabel(entry.to_status);
    return `${from} → ${to}`;
  }

  isPatchingFinding(findingId: number): boolean {
    return this.patchingFindingId() === findingId;
  }

  isDecisionLogOpen(findingId: number): boolean {
    return this.decisionLogFindingId() === findingId;
  }

  focusedFindingForProject(projectId: number): FieldFinding | null {
    if (this.summaryProjectId() !== projectId) {
      return null;
    }
    const id = this.decisionFocusFindingId();
    if (id == null) {
      return null;
    }
    return (
      this.summaryFindings().find(f => f.id === id) ??
      this.doobloDecisionFindings().find(f => f.id === id) ??
      null
    );
  }

  hasAnyFindingsForSummary(): boolean {
    return this.summaryFindings().length + this.doobloDecisionFindings().length > 0;
  }

  /** Selección del panel de decisión; segundo clic en la misma fila deselecciona. */
  selectFindingForDecision(findingId: number): void {
    if (this.decisionFocusFindingId() === findingId) {
      this.decisionFocusFindingId.set(null);
      this.decisionLogFindingId.set(null);
      this.decisionLogItems.set([]);
      this.decisionLogLoading.set(false);
      return;
    }
    this.decisionFocusFindingId.set(findingId);
    this.decisionLogFindingId.set(null);
    this.decisionLogItems.set([]);
    this.decisionLogLoading.set(false);
  }

  isFindingFocused(findingId: number): boolean {
    return this.decisionFocusFindingId() === findingId;
  }

  decisionLogActorLabel(entry: FieldFindingDecisionLog): string {
    const d = entry.actor_display?.trim();
    if (d) {
      return d;
    }
    return `Usuario #${entry.actor_user_id}`;
  }

  toggleFindingDecisionLog(projectId: number, findingId: number): void {
    if (this.decisionLogFindingId() === findingId) {
      this.decisionLogFindingId.set(null);
      this.decisionLogItems.set([]);
      this.decisionLogLoading.set(false);
      return;
    }
    this.decisionLogFindingId.set(findingId);
    this.decisionLogItems.set([]);
    this.decisionLogLoading.set(true);
    this.fieldSvc.listFindingDecisionLog(projectId, findingId, 100).subscribe({
      next: rows => {
        this.decisionLogItems.set(rows);
        this.decisionLogLoading.set(false);
      },
      error: (err: unknown) => {
        this.decisionLogLoading.set(false);
        this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudo cargar el historial de decisiones.'));
      },
    });
  }

  setFindingApproval(
    projectId: number,
    finding: FieldFinding,
    status: 'approved' | 'rejected' | 'pending'
  ): void {
    const noteRaw = this.getDecisionNote(finding.id).trim();
    this.patchingFindingId.set(finding.id);
    this.fieldSvc
      .patchFindingApproval(projectId, finding.id, {
        status,
        note: noteRaw || null,
      })
      .subscribe({
        next: updated => {
          this.applyPatchedFinding(updated);
          this.patchingFindingId.set(null);
          this.toast.showToast('success', 'Field', 'Decisión guardada; queda trazable en el historial.');
          if (this.decisionLogFindingId() === finding.id) {
            this.reloadOpenDecisionLog(projectId, finding.id);
          }
        },
        error: (err: unknown) => {
          this.patchingFindingId.set(null);
          this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudo actualizar el estado del hallazgo.'));
        },
      });
  }

  private applyPatchedFinding(updated: FieldFinding): void {
    this.summaryFindings.set(
      this.summaryFindings().map(f => (f.id === updated.id ? { ...f, ...updated } : f))
    );
    this.doobloDecisionFindings.set(
      this.doobloDecisionFindings().map(f => (f.id === updated.id ? { ...f, ...updated } : f))
    );
  }

  private reloadOpenDecisionLog(projectId: number, findingId: number): void {
    this.decisionLogLoading.set(true);
    this.fieldSvc.listFindingDecisionLog(projectId, findingId, 100).subscribe({
      next: rows => {
        this.decisionLogItems.set(rows);
        this.decisionLogLoading.set(false);
      },
      error: (err: unknown) => {
        this.decisionLogLoading.set(false);
        this.toast.showToast('error', 'Field', this.httpErrorDetail(err, 'No se pudo refrescar el historial.'));
      },
    });
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

  createStudy(): void {
    const cid = this.effectiveCompanyId();
    const clientId = this.selectedClientId();
    const name = this.newStudyName().trim();
    if (cid == null || clientId == null || !name) {
      this.toast.showToast('warn', 'Field', 'Cliente y nombre de estudio son obligatorios.');
      return;
    }
    const body = {
      name,
      description: this.newStudyDescription().trim() || null,
      client_id: clientId,
      company_id: this.isSuperAdmin ? cid : undefined,
    };
    this.fieldSvc.createStudy(body).subscribe({
      next: created => {
        this.newStudyName.set('');
        this.newStudyDescription.set('');
        this.selectedStudyId.set(created.id);
        this.toast.showToast('success', 'Field', 'Estudio creado; quedará vinculado al proyecto si lo crea a continuación.');
        this.reloadStudies();
        this.reloadStudyCatalog();
      },
      error: () =>
        this.toast.showToast('error', 'Field', 'No se pudo crear el estudio.'),
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
    const sid = this.selectedStudyId();
    const body = {
      name,
      description: this.newDescription().trim() || null,
      client_id: clientId,
      company_id: this.isSuperAdmin ? cid : undefined,
      ingest_mode: this.newIngestMode(),
      ...(sid != null ? { study_id: sid } : {}),
    };
    this.fieldSvc.createProject(body).subscribe({
      next: () => {
        this.newName.set('');
        this.newDescription.set('');
        this.newIngestMode.set('csv');
        this.toast.showToast('success', 'Field', 'Proyecto creado.');
        this.reloadProjects();
        this.reloadStudies();
        this.reloadStudyCatalog();
        this.activeStep.set(4);
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
