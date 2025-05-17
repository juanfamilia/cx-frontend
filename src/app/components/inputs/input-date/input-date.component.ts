/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-input-date',
  imports: [
    FormsModule,
    DatePickerModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    FloatLabel,
    NgIcon,
    NgClass,
  ],
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class InputDateComponent implements ControlValueAccessor {
  label = input.required<string>();
  icon = input<string>();
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  ErrorMessage = input<boolean>(true);
  showTime = input<boolean>(false);

  disabled = false;
  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  ngControl = inject(NgControl);
  private datePipe = inject(DatePipe);
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    this.ngControl.valueAccessor = this;
  }

  writeValue(value: any): void {
    this.value = value;
    this.cdRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: any): void {
    this.onChange(event);
    this.onTouched();
  }

  onClear(): void {
    console.log('onClear');
  }
}
