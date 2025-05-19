import { Pipe, PipeTransform } from '@angular/core';
import { ROLES } from '../constants/roles.constant';

@Pipe({
  name: 'roles',
})
export class RolePipe implements PipeTransform {
  transform(value: number): string {
    const role = ROLES.find(r => r.value === value);
    return role ? role.name : 'Desconocido';
  }
}
