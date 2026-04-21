import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { User } from '@interfaces/user';

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

  readonly me = signal<MeEntitlements | null>(null);
  readonly loaded = signal(false);

  private load$?: Observable<void>;

  /** Misma idea que probes backend: rol 0 ve productos en nav sin depender de flags. */
  canShowFieldNavLink(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    if (!this.loaded()) {
      return false;
    }
    return this.me()?.products.field === true;
  }

  canShowCleverNavLink(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    if (!this.loaded()) {
      return false;
    }
    return this.me()?.products.clever === true;
  }

  canEnterFieldApp(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    return this.me()?.products.field === true;
  }

  canEnterCleverApp(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    return this.me()?.products.clever === true;
  }

  refresh(): Observable<void> {
    this.load$ = undefined;
    this.loaded.set(false);
    this.me.set(null);
    return this.ensureLoaded();
  }

  ensureLoaded(companyId?: number | null): Observable<void> {
    if (this.loaded()) {
      return of(void 0);
    }
    if (!this.load$) {
      this.load$ = this.getMe(companyId).pipe(
        tap(res => this.me.set(res)),
        map(() => void 0),
        catchError(() => {
          this.me.set({
            company_id: null,
            products: { cx: false, ins: false, field: false, clever: false },
          });
          return of(void 0);
        }),
        finalize(() => this.loaded.set(true)),
        shareReplay(1)
      );
    }
    return this.load$;
  }

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
