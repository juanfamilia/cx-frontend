import { Pipe, PipeTransform } from '@angular/core';
import { State } from 'country-state-city';

@Pipe({
  name: 'stateName',
})
export class StateNamePipe implements PipeTransform {
  transform(isoCode: string, countryCode = 'DO'): string {
    if (!isoCode) return '';
    const state = State.getStatesOfCountry(countryCode).find(
      s => s.isoCode === isoCode
    );
    return state?.name || isoCode;
  }
}
