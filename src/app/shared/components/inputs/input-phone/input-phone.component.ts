/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-input-phone',
  imports: [
    FormsModule,
    InputMaskModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    FloatLabel,
    NgIcon,
    NgClass,
  ],
  templateUrl: './input-phone.component.html',
  styleUrl: './input-phone.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPhoneComponent implements ControlValueAccessor {
  label = input.required<string>();
  icon = input<string>();
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  ErrorMessage = input<boolean>(true);

  disabled = false;
  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  ngControl = inject(NgControl);

  constructor() {
    this.ngControl.valueAccessor = this;
  }

  writeValue(value: any): void {
    this.value = value;
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

  onInput(event: any): void {
    this.value = event;
    this.onChange(this.value);
    this.onTouched();
  }
}
