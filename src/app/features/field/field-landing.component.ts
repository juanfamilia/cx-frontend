import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-field-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './field-landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldLandingComponent {}
