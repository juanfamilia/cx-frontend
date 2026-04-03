import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { UserCreate } from '@interfaces/user';
import { AuthService } from '@core/services/auth.service';
import { ShareToasterService } from '@core/services/toast.service';
import { UsersService } from '@pages/users/users.service';
import { UserFormComponent } from '../components/user-form/user-form.component';

@Component({
  selector: 'app-user-create',
  imports: [UserFormComponent, PageHeaderComponent],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent {
  private usersService = inject(UsersService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly currentUser = this.authService.getCurrentUser();

  /** Gerente sin empresa en el perfil: el API rechazará la creación hasta que lo corrija un admin. */
  readonly managerMissingCompany =
    this.currentUser.role === 2 &&
    (this.currentUser.company_id == null || this.currentUser.company_id <= 0);

  createUser(data: UserCreate) {
    this.usersService.create(data).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Usuario creado',
          'El usuario ha sido creado exitosamente.'
        );
        this.router.navigate(['/users']);
      },
      error: err => {
        const d = err?.error?.detail;
        const msg =
          typeof d === 'string'
            ? d
            : Array.isArray(d) && d[0]?.msg
              ? d[0].msg
              : 'No se pudo crear el usuario.';
        this.toastService.showToast('error', 'Error al crear usuario', msg);
        console.error('Error creating user:', err);
      },
    });
  }
}
