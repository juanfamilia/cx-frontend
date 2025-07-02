import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-button-secondary',
  imports: [NgIcon, TooltipModule, ButtonModule],
  templateUrl: './button-secondary.component.html',
  styleUrl: './button-secondary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonSecondaryComponent {
  title = input<string>();
  icon = input<string>('');
  buttonType = input<string>('button');
  disabled = input<boolean>(false);
  event = output();
  tooltip = input<string>();
  isLoading = input<boolean>(false);
  styleClass = input<string>('');

  onClick() {
    this.event.emit();
  }
}
