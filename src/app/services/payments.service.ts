import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Payment, PaymentCreate, PaymentList } from '@interfaces/payments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private http = inject(HttpClient);

  getAll(
    offset = 0,
    limit = 10,
    filter?: string,
    search?: string
  ): Observable<PaymentList> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaymentList>(environment.apiUrl + 'payment', {
      params,
    });
  }

  create(data: PaymentCreate): Observable<Payment> {
    return this.http.post<Payment>(environment.apiUrl + 'payment/', data);
  }

  getOne(id: number): Observable<Payment> {
    return this.http.get<Payment>(environment.apiUrl + 'payment/' + id);
  }

  update(data: PaymentCreate, id: number): Observable<Payment> {
    return this.http.put<Payment>(environment.apiUrl + 'payment/' + id, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + 'payment/' + id);
  }
}
