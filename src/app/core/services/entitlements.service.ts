import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

export interface MeEntitlements {
  company_id: number | null;
  products: {
    cx: boolean;
    ins: boolean;
    field: boolean;
    clever: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EntitlementsService {
  private readonly http = inject(HttpClient);

  /** Rol 0: opcional `company_id` del tenant a consultar. */
  getMe(companyId?: number | null): Observable<MeEntitlements> {
    const base = environment.apiUrl + 'entitlements/me';
    if (companyId != null && Number.isFinite(companyId)) {
      return this.http.get<MeEntitlements>(base, {
        params: { company_id: String(companyId) },
      });
    }
    return this.http.get<MeEntitlements>(base);
  }
}
