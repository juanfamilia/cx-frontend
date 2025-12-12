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
import { MessageModule } from 'primeng/message';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-input-multi-select',
  imports: [
    FormsModule,
    MultiSelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    FloatLabel,
    NgIcon,
    NgClass,
  ],
  templateUrl: './input-multi-select.component.html',
  styleUrl: './input-multi-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMultiSelectComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input.required<string>();
  options = input.required<Options[]>();
  placeholder = input<string | undefined>();
  icon = input<string>();
  filter = input<boolean>(false);
  maxSelectedLabels = input<number>(999);
  loading = input<boolean>(false);
  errorMessage = input<boolean>(true);

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

  onSelect(event: MultiSelectChangeEvent): void {
    this.onChange(event.value);
    this.onTouched();
  }
}
