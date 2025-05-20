import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { CompanyCreate } from '@interfaces/company';
import { CompaniesService } from '@services/companies.service';
import { ShareToasterService } from '@services/toast.service';
import { CompanyFormComponent } from '../components/company-form/company-form.component';

@Component({
  selector: 'app-company-create',
  imports: [PageHeaderComponent, CompanyFormComponent],
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCreateComponent {
  private companyService = inject(CompaniesService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);

  createCompany(data: CompanyCreate) {
    this.companyService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Empresa creada',
          'La empresa ha sido creada exitosamente.'
        );
        this.router.navigate(['/companies']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al crear la empresa',
          err.message
        );
        console.error('Error creating company:', err);
      },
    });
  }
}
