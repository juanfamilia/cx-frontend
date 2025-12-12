import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
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
export class ButtonSecondaryComponent implements OnInit {
  title = input<string>();
  icon = input<string>('');
  buttonType = input<string>('button');
  disabled = input<boolean>(false);
  event = output();
  tooltip = input<string>();
  isLoading = input<boolean>(false);
  styleClass = input<string>('py-1.5');

  show = signal<boolean>(false);

  onClick() {
    this.event.emit();
  }

  setStyleClass() {
    return `${this.styleClass()} dark:bg-bright-gray-800 dark:border-bright-gray-950 dark:hover:bg-bright-gray-900 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition-color duration-200 ease-in-out hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-300/90 md:px-4 dark:text-gray-300`;
  }

  ngOnInit() {
    this.show.set(true);
  }
}
