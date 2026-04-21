import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { Company } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';

import { InsStudy, InsStudyService } from './ins-study.service';

@Component({
  selector: 'app-ins-study-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './ins-study-list.component.html',
  styleUrl: './ins-study-list.component.css',
})
export class InsStudyListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly insSvc = inject(InsStudyService);
  private readonly toast = inject(ShareToasterService);
  private readonly companiesSvc = inject(CompaniesService);

  readonly user = this.auth.getCurrentUser();
  readonly studies = signal<InsStudy[]>([]);
  readonly loading = signal(false);
  readonly companies = signal<Company[]>([]);
  readonly selectedCompanyId = signal<number | null>(null);

  readonly newTitle = signal('');
  readonly newObjective = signal('');

  readonly isSuperAdmin = this.user.role === 0;

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.companiesSvc.getAll(0, 200).subscribe({
        next: res => {
          this.companies.set(res.data);
          const first = res.data[0]?.id ?? null;
          this.selectedCompanyId.set(first);
          if (first != null) {
            this.reload();
          }
        },
        error: () =>
          this.toast.showToast('error', 'InS', 'No se pudieron cargar empresas.'),
      });
    } else {
      this.selectedCompanyId.set(this.user.company_id ?? null);
      this.reload();
    }
  }

  onCompanySelect(ev: Event): void {
    const v = Number((ev.target as HTMLSelectElement).value);
    if (Number.isFinite(v) && v > 0) {
      this.selectedCompanyId.set(v);
      this.reload();
    }
  }

  reload(): void {
    const cid = this.selectedCompanyId();
    if (cid == null) {
      return;
    }
    this.loading.set(true);
    this.insSvc.listStudies(cid).subscribe({
      next: rows => {
        this.studies.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.showToast('error', 'InS', 'No se pudieron cargar estudios.');
      },
    });
  }

  createStudy(): void {
    const title = this.newTitle().trim();
    if (!title) {
      this.toast.showToast('warn', 'InS', 'Indique un título.');
      return;
    }
    const cid = this.selectedCompanyId();
    const body: { title: string; objective?: string; company_id?: number } = {
      title,
      objective: this.newObjective().trim() || undefined,
    };
    if (this.isSuperAdmin && cid != null) {
      body.company_id = cid;
    }

    this.insSvc.createStudy(body).subscribe({
      next: () => {
        this.newTitle.set('');
        this.newObjective.set('');
        this.toast.showToast('success', 'InS', 'Estudio creado.');
        this.reload();
      },
      error: () =>
        this.toast.showToast('error', 'InS', 'No se pudo crear el estudio.'),
    });
  }

  runPipeline(id: number): void {
    this.insSvc.runPipeline(id).subscribe({
      next: () => {
        this.toast.showToast('success', 'InS', 'Pipeline ejecutado (MVP stub).');
        this.reload();
      },
      error: () =>
        this.toast.showToast('error', 'InS', 'No se pudo ejecutar el pipeline.'),
    });
  }
}
