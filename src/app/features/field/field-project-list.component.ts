import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';

import {
  EndClient,
  FieldFinding,
  FieldImportRun,
  FieldProject,
  FieldService,
} from './field.service';

/** Texto fijo por código técnico — lo ve el cliente sin leer el backend. */
const FINDING_KIND_LABEL: Record<string, string> = {
  ROW_INCOMPLETE: 'Fila no guardada (faltan datos clave)',
  DUPLICATE_CASE: 'Mismo caso repetido en el archivo',
  INVALID_DURATION: 'Duración del caso a revisar',
};

@Component({
  selector: 'app-field-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './field-project-list.component.html',
  styleUrl: './field-project-list.component.css',
})
export class FieldProjectListComponent implements OnInit {
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
  readonly newClientName = signal('');

  readonly isSuperAdmin = this.user.role === 0;

  /** Proyecto cuyo panel de resumen está abierto (null = ninguno). */
  readonly summaryProjectId = signal<number | null>(null);
  readonly summaryLoading = signal(false);
  readonly summaryRun = signal<FieldImportRun | null>(null);
  readonly summaryFindings = signal<FieldFinding[]>([]);
  /** Líneas de datos leídas en el CSV (cabecera no cuenta); viene del registro de auditoría. */
  readonly summaryLinesSeen = signal<number | null>(null);

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, 200).subscribe({
        next: res => {
          this.companies.set(res.data);
          const first = res.data[0]?.id ?? null;
          this.selectedCompanyId.set(first);
          if (first != null) {
            this.reloadClientsAndProjects();
          }
        },
        error: () =>
          this.toast.showToast('error', 'Field', 'No se pudieron cargar empresas.'),
      });
    } else {
      this.selectedCompanyId.set(this.user.company_id ?? null);
      this.reloadClientsAndProjects();
    }
  }

  effectiveCompanyId(): number | null {
    return this.selectedCompanyId();
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
    this.summaryProjectId.set(null);
    this.summaryRun.set(null);
    this.summaryFindings.set([]);
    this.summaryLinesSeen.set(null);
    this.summaryLoading.set(false);
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

    this.fieldSvc.listImportRuns(projectId, 15).subscribe({
      next: runs => {
        const run = runs[0] ?? null;
        if (!run) {
          this.summaryLoading.set(false);
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
            this.summaryLoading.set(false);
          },
          error: () => {
            this.summaryLoading.set(false);
            this.toast.showToast('error', 'Field', 'No se pudo cargar el resumen de la última importación.');
          },
        });
      },
      error: () => {
        this.summaryLoading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudieron leer las importaciones del proyecto.');
      },
    });
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

  severityPlain(sev: string): string {
    if (sev === 'error') {
      return 'Requiere acción';
    }
    if (sev === 'warn') {
      return 'Conviene revisar';
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
    };
    this.fieldSvc.createProject(body).subscribe({
      next: () => {
        this.newName.set('');
        this.newDescription.set('');
        this.toast.showToast('success', 'Field', 'Proyecto creado.');
        this.reloadProjects();
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
