/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-input-select',
  imports: [
    FormsModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    FloatLabel,
    NgIcon,
    NgClass,
  ],
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input.required<string>();
  options = input.required<Options[]>();
  placeholder = input<string | undefined>();
  icon = input<string>();
  clear = input<boolean>(true);
  filter = input<boolean>(false);
  errorMessage = input<boolean>(true);

  selectChange = output<SelectChangeEvent>();

  value: any;
  disabled = false;
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

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: SelectChangeEvent): void {
    this.selectChange.emit(event);
    this.onChange(event.value);
    this.onTouched();
  }
}
