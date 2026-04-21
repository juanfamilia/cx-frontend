import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

const DEFAULT_MSG =
  'Su empresa no tiene activa esta licencia. Pídale al superadmin que la active en la ficha de la empresa.';

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
  private readonly destroyRef = inject(DestroyRef);

  readonly message = signal<string>(DEFAULT_MSG);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.applyProduct(q.get('product')));
  }

  private applyProduct(p: string | null): void {
    if (p === 'field') {
      this.message.set(
        'Siete Field no está habilitado para su empresa. Un superadmin puede activarlo en Empresas → editar empresa → Productos Siete.'
      );
    } else if (p === 'clever') {
      this.message.set(
        'Siete Clever no está habilitado para su empresa. Un superadmin puede activarlo en Empresas → editar empresa → Productos Siete.'
      );
    } else {
      this.message.set(DEFAULT_MSG);
    }
  }
}
