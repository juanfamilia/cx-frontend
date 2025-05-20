import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonDangerComponent } from '@components/buttons/button-danger/button-danger.component';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash, lucideUserPlus } from '@ng-icons/lucide';
import { ShareToasterService } from '@services/toast.service';
import { UsersService } from '@services/users.service';
import { PaginatorState } from 'primeng/paginator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    TableComponent,
    PageHeaderComponent,
    ButtonDangerComponent,
    ButtonSecondaryComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideUserPlus, lucidePencil, lucideTrash })],
})
export class UserDashboardComponent {
  private usersService = inject(UsersService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);

  pagination = signal<PaginatorState>({
    page: 0,
    first: 0,
    rows: 10,
  });

  searchEvent = signal<{ filter: string; search: string } | null>(null);

  columns = signal<TableColumn[]>([
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
      field: 'role',
      header: 'Rol',
      sortable: true,
      pipe: 'roles',
    },
    {
      header: 'Acciones',
      type: 'custom',
      customTemplate: 'actions',
    },
  ]);

  filters = signal<Options[]>([
    {
      name: 'Nombre y Apellido',
      value: 'full_name',
    },
    {
      name: 'Correo Electrónico',
      value: 'email',
    },
    {
      name: 'Empresa',
      value: 'company',
    },
  ]);

  usersResource = rxResource({
    request: () => ({
      pagination: this.pagination(),
      search: this.searchEvent(),
    }),
    loader: ({ request }) =>
      this.usersService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.search?.filter,
        request.search?.search
      ),
  });

  createUser() {
    this.router.navigate(['/users/create']);
  }

  updateUser(id: number) {
    this.router.navigate(['/users/update/' + id]);
  }

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
          'Error al eliminar el usuario',
          err.message
        );
      },
    });
  }
}
