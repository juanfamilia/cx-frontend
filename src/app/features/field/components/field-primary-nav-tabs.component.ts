import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

export type FieldPrimaryNavTabId =
  | 'inicio'
  | 'resumen'
  | 'centro'
  | 'operaciones'
  | 'neutral';

@Component({
  selector: 'app-field-primary-nav-tabs',
  standalone: true,
  imports: [NgClass, RouterLink],
  template: `
    <nav
      class="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-700"
      aria-label="Secciones principales de Field">
      <a
        routerLink="/field"
        class="inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        [ngClass]="navTabClass('inicio')"
        >Inicio Field</a
      >
      <a
        routerLink="/field/projects"
        class="inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        [ngClass]="navTabClass('resumen')"
        >Resumen de proyectos</a
      >
      <a
        routerLink="/field/trabajo"
        [queryParams]="{ focus: 'overview' }"
        class="inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        [ngClass]="navTabClass('centro')"
        >Centro de mando</a
      >
      <a
        routerLink="/field/trabajo"
        queryParamsHandling=""
        class="inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        [ngClass]="navTabClass('operaciones')"
        >Operaciones y Asistente</a
      >
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class FieldPrimaryNavTabsComponent {
  private readonly router = inject(Router);

  /** Estado visual activo según URL actual. */
  readonly activeTab = signal<FieldPrimaryNavTabId>(
    FieldPrimaryNavTabsComponent.tabFromUrl(this.router.url)
  );

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() =>
        this.activeTab.set(FieldPrimaryNavTabsComponent.tabFromUrl(this.router.url))
      );
  }

  navTabClass(tab: Exclude<FieldPrimaryNavTabId, 'neutral'>): Record<string, boolean> {
    const on = this.activeTab() === tab;
    return {
      'border-transparent bg-indigo-600 text-white shadow-sm dark:bg-indigo-500': on,
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800':
        !on,
    };
  }

  static tabFromUrl(fullUrl: string): FieldPrimaryNavTabId {
    const noHash = fullUrl.split('#')[0] ?? '';
    const qIdx = noHash.indexOf('?');
    const path = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
    const query = qIdx >= 0 ? noHash.slice(qIdx + 1) : '';
    const params = new URLSearchParams(query);

    if (path === '/field') {
      return 'inicio';
    }
    if (path === '/field/projects') {
      return 'resumen';
    }
    if (path === '/field/trabajo') {
      return params.get('focus') === 'overview' ? 'centro' : 'operaciones';
    }
    if (path.startsWith('/field/project/')) {
      return 'neutral';
    }
    return 'neutral';
  }
}
