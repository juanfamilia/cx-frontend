import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ShareToasterService {
  constructor(private messageService: MessageService) {}

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  showSuccess(detail: string, summary: string = 'Éxito') {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  showError(detail: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  showInfo(detail: string, summary: string = 'Información') {
    this.messageService.add({ severity: 'info', summary, detail });
  }

  showWarn(detail: string, summary: string = 'Advertencia') {
    this.messageService.add({ severity: 'warn', summary, detail });
  }
}
