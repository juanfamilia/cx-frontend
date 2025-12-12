import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(rawNum: string) {
    const areaCodeStr = rawNum.slice(0, 4);
    const midSectionStr = rawNum.slice(4, 7);
    const lastSectionStr = rawNum.slice(7, 11);

    return `(${areaCodeStr}) ${midSectionStr}-${lastSectionStr}`;
  }
}
