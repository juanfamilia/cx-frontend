import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationCircle } from '@ng-icons/heroicons/outline';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-button-danger',
  imports: [NgIcon, ButtonModule, ConfirmDialog, TooltipModule],
  templateUrl: './button-danger.component.html',
  styleUrl: './button-danger.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  viewProviders: [provideIcons({ heroExclamationCircle })],
})
export class ButtonDangerComponent {
  title = input<string>();
  header = input<string>('¡Cuidado!');
  message = input.required<string>();
  icon = input<string>('');
  buttonType = input<string>('button');
  disabled = input<boolean>(false);
  event = output<boolean>();
  tooltip = input<string>('');

  private confirmationService = inject(ConfirmationService);

  confirmEvent() {
    this.confirmationService.confirm({
      header: this.header(),
      message: this.message(),
      accept: () => {
        this.event.emit(true);
      },
      reject: () => {
        this.event.emit(false);
      },
    });
  }
}
