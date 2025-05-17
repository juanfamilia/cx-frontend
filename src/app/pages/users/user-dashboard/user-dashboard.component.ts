import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableComponent } from '@components/table/table.component';
import { TableColumn } from '@interfaces/table-column';
import { UsersService } from '@services/users.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [TableComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  private usersService = inject(UsersService);

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
}
