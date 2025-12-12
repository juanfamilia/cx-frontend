import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
}
