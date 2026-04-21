import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-clever-home',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-6">
      <app-page-header
        title="Siete Clever"
        description="Analítica cuantitativa reproducible. Pantalla inicial: el módulo se conectará aquí cuando el backend Clever esté listo." />
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        Licencia activa para su empresa. Use el menú lateral para volver al resto de Siete CX.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CleverHomeComponent {}
