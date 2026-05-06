import { Injectable, signal } from '@angular/core';

/**
 * Empresa (tenant) activa para vistas Field cuando el usuario es superadmin.
 * Mantiene la selección al cambiar entre Inicio, Fuentes, etc.
 */
@Injectable({ providedIn: 'root' })
export class FieldTenantContextService {
  readonly selectedCompanyId = signal<number | null>(null);

  setSelectedCompanyId(id: number | null): void {
    this.selectedCompanyId.set(id);
  }
}
