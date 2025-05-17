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

    return this.limpiarNombreEstado(state?.name || isoCode);
  }

  limpiarNombreEstado(nombre: string): string {
    return nombre
      .replace(/\b(Province|State|Department|Region)\b/gi, '')
      .trim();
  }
}
