import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonDangerComponent } from '@components/buttons/button-danger/button-danger.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { ShareToasterService } from '@services/toast.service';
import { UsersService } from '@services/users.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    TableComponent,
    PageHeaderComponent,
    ButtonDangerComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucidePencil, lucideTrash })],
})
export class UserDashboardComponent {
  private usersService = inject(UsersService);
  private toastService = inject(ShareToasterService);

  usersResource = rxResource({
    loader: () => this.usersService.getAll(),
  });

  columns = signal<TableColumn[]>([
    {
      field: 'id',
      header: 'ID',
    },
    {
      field: 'first_name',
      header: 'Nombre(s)',
      sortable: true,
    },
    {
      field: 'last_name',
      header: 'Apellido(s)',
      sortable: true,
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      field: 'company.name',
      header: 'Empresa',
      sortable: true,
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);

  deleteUser(id: number) {
    this.usersService.delete(id).subscribe({
      next: () => {
        this.usersResource.reload();
        this.toastService.showToast(
          'success',
          'Usuario eliminado',
          'El usuario ha sido eliminado exitosamente.'
        );
      },
      error: err => {
        console.error('Error deleting user:', err);
        this.toastService.showToast(
          'error',
          'Error al eliminar usuario',
          err.message
        );
      },
    });
  }
}
