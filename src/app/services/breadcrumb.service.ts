import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  items = signal<MenuItem[]>([{ route: ['/'], icon: 'heroHome' }]);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumb();
      });
  }

  updateBreadcrumb() {
    const breadcrumbItems: MenuItem[] = [];
    let currentRoute = this.activatedRoute.root;
    let url = '';

    while (currentRoute.children.length > 0) {
      const childRoute = currentRoute.children.find(
        route => route.outlet === 'primary'
      );
      if (!childRoute) break;

      const routeConfig = childRoute.routeConfig;
      if (routeConfig?.path) {
        // Agregar segmento a la URL
        url += `/${childRoute.snapshot.url.map(segment => segment.path).join('/')}`;

        // Obtener el título definido en la ruta
        const title = childRoute.snapshot.data['title'] || routeConfig.path;
        breadcrumbItems.push({ label: title, route: [url] });
      }

      currentRoute = childRoute;
    }

    this.items.set([{ route: ['/'], icon: 'heroHome' }, ...breadcrumbItems]);
  }
}
