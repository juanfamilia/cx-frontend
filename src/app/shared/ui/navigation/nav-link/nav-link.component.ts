import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RouteData } from 'src/app/types/routeData';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './nav-link.component.html',
  styleUrl: './nav-link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLinkComponent {
  navLinkData = input.required<RouteData>();
  showTitle = input<boolean>(true);

  /**
   * `exact: true` en todo el menú impedía marcar activos `/ins`, `/field`, etc. cuando la URL
   * no coincidía al carácter (hijos, query, o segmentación). Home sigue siendo match exacto.
   */
  readonly linkActiveOptions = computed<IsActiveMatchOptions>(() => {
    const path = this.navLinkData().route;
    if (path === '/') {
      return {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      };
    }
    return {
      paths: 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    };
  });
}
