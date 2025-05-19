import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { UserCreate } from '@interfaces/user';
import { ShareToasterService } from '@services/toast.service';
import { UsersService } from '@services/users.service';
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
        this.toastService.showToast(
          'error',
          'Error al crear usuario',
          err.message
        );
        console.error('Error creating user:', err);
      },
    });
  }
}
