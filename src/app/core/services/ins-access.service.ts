import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { User } from '@interfaces/user';

export interface InsAccessResponse {
  ins_enabled: boolean;
  scope?: string | null;
  company_id?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class InsAccessService {
  private readonly http = inject(HttpClient);

  /** Estado del último `GET /ins/access` (para nav reactiva). */
  readonly access = signal<InsAccessResponse | null>(null);
  readonly loaded = signal(false);

  private load$?: Observable<void>;

  /** Indica si el enlace de InS debe mostrarse (nav). */
  canShowInsNavLink(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    if (!this.loaded()) {
      return false;
    }
    return this.access()?.ins_enabled === true;
  }

  /** Acceso efectivo a rutas /ins (tras `ensureLoaded`). */
  canEnterInsApp(user: User): boolean {
    if (user.role === 0) {
      return true;
    }
    return this.access()?.ins_enabled === true;
  }

  refresh(): Observable<void> {
    this.load$ = undefined;
    this.loaded.set(false);
    this.access.set(null);
    return this.ensureLoaded();
  }

  ensureLoaded(): Observable<void> {
    if (this.loaded()) {
      return of(void 0);
    }
    if (!this.load$) {
      this.load$ = this.http.get<InsAccessResponse>(environment.apiUrl + 'ins/access').pipe(
        tap(res => this.access.set(res)),
        map(() => void 0),
        catchError(() => {
          this.access.set({ ins_enabled: false, scope: null });
          return of(void 0);
        }),
        finalize(() => this.loaded.set(true)),
        shareReplay(1)
      );
    }
    return this.load$;
  }
}
