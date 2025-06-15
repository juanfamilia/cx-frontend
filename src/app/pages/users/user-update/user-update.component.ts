import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { User, UserCreate } from '@interfaces/user';
import { ShareToasterService } from '@services/toast.service';
import { UsersService } from '@services/users.service';
import { UserFormComponent } from '../components/user-form/user-form.component';

@Component({
  selector: 'app-user-update',
  imports: [PageHeaderComponent, UserFormComponent, SpinnerComponent],
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserUpdateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private usersService = inject(UsersService);

  id = signal<number>(0);
  user = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      this.isLoading.set(true);
      this.usersService.getOne(this.id()).subscribe({
        next: user => {
          this.user.set(user);
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

  updateUser(data: UserCreate) {
    this.usersService.update(data, this.id()).subscribe({
      next: () => {
        this.toastService.showToast(
          'success',
          'Usuario actualizado',
          'El usuario ha sido actualizado exitosamente.'
        );
        this.router.navigate(['/users']);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al actualizar usuario',
          err.message
        );
        console.error('Error updating user:', err);
      },
    });
  }
}
