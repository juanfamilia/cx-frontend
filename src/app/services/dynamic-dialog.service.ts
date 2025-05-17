import { inject, Injectable, signal, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class DynamicDialogService {
  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;

  event = signal<boolean>(false);

  showDialog<T>(
    component: Type<T>,
    header?: string,
    width?: string,
    height?: string,
    data?: unknown
  ) {
    this.ref = this.dialogService.open(component, {
      data,
      header: header,
      width: width || '40vw',
      height: height || '50vh',
      modal: true,
      closable: true,
      dismissableMask: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      maximizable: true,
    });

    this.ref.onClose.subscribe(eventData => {
      if (eventData) {
        this.event.set(!this.event());
      }
    });
  }
}
