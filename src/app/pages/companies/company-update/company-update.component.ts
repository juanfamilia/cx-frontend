import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { Company, CompanyCreate } from '@interfaces/company';
import { CompaniesService } from '@services/companies.service';
import { ShareToasterService } from '@services/toast.service';
import { CompanyFormComponent } from '../components/company-form/company-form.component';

@Component({
  selector: 'app-company-update',
  imports: [PageHeaderComponent, CompanyFormComponent],
  templateUrl: './company-update.component.html',
  styleUrl: './company-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyUpdateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private companyService = inject(CompaniesService);

  id = signal<number>(0);
  company = signal<Company | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.companyService.getOne(this.id()).subscribe({
        next: user => {
          this.company.set(user);
        },
        error: err => {
          this.toastService.showToast(
            'error',
            'Error al obtener usuario',
            err.message
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  updateCompany(data: CompanyCreate) {
    this.companyService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Empresa actualizada',
          'La empresa ha sido actualizada exitosamente.'
        );
        this.router.navigate(['/companies']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar empresa',
          err.message
        );
        console.error('Error updating company:', err);
      },
    });
  }
}
