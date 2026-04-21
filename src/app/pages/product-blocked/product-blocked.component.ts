import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-blocked',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="mx-auto max-w-lg px-4 py-16 text-center text-gray-800 dark:text-gray-100">
      <h1 class="text-xl font-semibold">Producto no habilitado</h1>
      <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {{ message() }}
      </p>
      <a
        routerLink="/"
        class="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
        Volver al inicio
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductBlockedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly message = signal<string>(
    'Su empresa no tiene activa esta licencia. Pídale al superadmin que la active en la ficha de la empresa.'
  );

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap.get('product');
    if (p === 'field') {
      this.message.set(
        'Siete Field no está habilitado para su empresa. Un superadmin puede activarlo en Empresas → editar empresa → Productos Siete.'
      );
    } else if (p === 'clever') {
      this.message.set(
        'Siete Clever no está habilitado para su empresa. Un superadmin puede activarlo en Empresas → editar empresa → Productos Siete.'
      );
    }
  }
}
