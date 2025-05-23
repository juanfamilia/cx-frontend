/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import { State } from 'country-state-city';
import { StateNamePipe } from 'src/app/pipes/state-name.pipe';
import { Options } from 'src/app/types/options';
import { InputSelectComponent } from '../input-select/input-select.component';

@Component({
  selector: 'app-input-location',
  imports: [FormsModule, InputSelectComponent, ReactiveFormsModule],
  templateUrl: './input-location.component.html',
  styleUrl: './input-location.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideMapPin })],
  providers: [StateNamePipe],
})
export class InputLocationComponent implements OnInit {
  private stateNamePipe = inject(StateNamePipe);

  formGroup = input.required<FormGroup>();
  controlNameState = input.required<string>();

  userCountryCode = 'DO';
  states = signal<Options[]>([]);

  selectedState = model<string | null>();

  ngOnInit() {
    this.loadStates();

    const initialState = this.formGroup().get(this.controlNameState())?.value;

    if (initialState) {
      this.selectedState.set(initialState);
    }
  }

  loadStates() {
    this.states.set(
      State.getStatesOfCountry(this.userCountryCode).map(state => ({
        name: this.stateNamePipe.transform(state.isoCode),
        value: state.isoCode,
      }))
    );
  }

  onStateChange(event: any) {
    const stateCode = event.value;
    this.selectedState.set(stateCode);
  }
}
