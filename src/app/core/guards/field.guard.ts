import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { EntitlementsService } from '@core/services/entitlements.service';

/** Tras `authGuard`: licencia Field (rol 0 siempre). */
export const fieldGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const ent = inject(EntitlementsService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    switchMap(ok => {
      if (!ok) {
        return of(router.createUrlTree(['/login']));
      }
      const user = auth.getCurrentUser();
      return ent.ensureLoaded().pipe(
        map(() =>
          ent.canEnterFieldApp(user) ? true : router.createUrlTree(['/'])
        )
      );
    })
  );
};
