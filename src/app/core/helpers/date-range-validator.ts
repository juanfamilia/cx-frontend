import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const startDate = control.get('date_start')?.value;
  const endDate = control.get('date_end')?.value;

  if (!startDate || !endDate) {
    return null; // Si no hay fechas, no hay error
  }

  return new Date(startDate) < new Date(endDate) ? null : { dateInvalid: true };
};
