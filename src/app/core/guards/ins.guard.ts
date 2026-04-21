import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { InsAccessService } from '@core/services/ins-access.service';

/**
 * Tras `authGuard`: exige licencia InS para la empresa (rol 0 siempre).
 */
export const insGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const ins = inject(InsAccessService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    switchMap(ok => {
      if (!ok) {
        return of(router.createUrlTree(['/login']));
      }
      const user = auth.getCurrentUser();
      return ins.ensureLoaded().pipe(
        map(() => {
          if (ins.canEnterInsApp(user)) {
            return true;
          }
          return router.createUrlTree(['/']);
        })
      );
    })
  );
};
