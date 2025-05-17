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
import { AuthService } from '@services/auth.service';
import { City, State } from 'country-state-city';
import { Options } from 'src/app/types/options';
import { InputSelectComponent } from '../input-select/input-select.component';

@Component({
  selector: 'app-input-location',
  imports: [FormsModule, InputSelectComponent, ReactiveFormsModule],
  templateUrl: './input-location.component.html',
  styleUrl: './input-location.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideMapPin })],
})
export class InputLocationComponent implements OnInit {
  formGroup = input.required<FormGroup>();
  controlNameState = input.required<string>();
  controlNameCity = input.required<string>();

  private authService = inject(AuthService);

  userCountryCode = this.authService.getCurrentUser().country_code || 'VE';
  states = signal<Options[]>([]);
  cities = signal<Options[]>([]);

  selectedState = model<string | null>();
  selectedCity = model<string | null>();

  ngOnInit() {
    this.loadStates();

    const initialState = this.formGroup().get(this.controlNameState())?.value;
    const initialCity = this.formGroup().get(this.controlNameCity())?.value;

    if (initialState) {
      this.selectedState.set(initialState);
      this.loadCities(initialState);

      // Opcional: Establecer la ciudad
      if (initialCity) {
        this.selectedCity.set(initialCity);
      }
    }
  }

  loadStates() {
    this.states.set(
      State.getStatesOfCountry(this.userCountryCode).map(state => ({
        name: state.name,
        value: state.isoCode,
      }))
    );
  }

  onStateChange(event: any) {
    const stateCode = event.value;
    this.selectedState.set(stateCode);
    this.selectedCity.set(null);
    this.loadCities(stateCode);
  }

  loadCities(stateCode: string) {
    this.cities.set(
      City.getCitiesOfState(this.userCountryCode, stateCode).map(city => ({
        name: city.name,
        value: city.name,
      }))
    );
  }
}
