import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Payment } from '@interfaces/payments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private http = inject(HttpClient);

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(environment.apiUrl + 'payment/');
  }
}
