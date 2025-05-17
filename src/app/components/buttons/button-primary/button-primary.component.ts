import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-button-primary',
  imports: [ButtonModule, NgIcon],
  templateUrl: './button-primary.component.html',
  styleUrl: './button-primary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPrimaryComponent {
  title = input<string>();
  icon = input<string>('');
  buttonType = input<string>('button');
  disabled = input<boolean>(false);
  event = output();

  onClick() {
    this.event.emit();
  }
}
