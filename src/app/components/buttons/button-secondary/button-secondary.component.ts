import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-button-secondary',
  imports: [NgIcon],
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

  onClick() {
    this.event.emit();
  }
}
