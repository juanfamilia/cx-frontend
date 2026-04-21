import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';

import {
  EndClient,
  FieldProject,
  FieldService,
} from './field.service';

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
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'Field', 'No se pudieron cargar proyectos.');
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
            `Completada. Filas: ${run.row_count ?? 0}.`
          );
        } else {
          this.toast.showToast(
            'error',
            'Importación',
            run.error_detail ?? 'Falló la validación del CSV.'
          );
        }
      },
      error: () => {
        input.value = '';
        this.toast.showToast('error', 'Importación', 'Error al subir el archivo.');
      },
    });
  }
}
