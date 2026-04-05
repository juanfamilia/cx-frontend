// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map, Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['role'] as number[] | undefined;

  return authService.isAuth().pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
      }

      let userRole: number | undefined = undefined;
      try {
        const user = authService.getCurrentUser();
        const raw = (user as any)?.role;
        if (raw !== undefined && raw !== null) {
          const n = Number(raw);
          userRole = Number.isNaN(n) ? undefined : n;
        }
      } catch {
        // si falla currentUser, se trata como no logueado
        return router.createUrlTree(['/login']);
      }

      if (
        allowedRoles &&
        userRole !== undefined &&
        !allowedRoles.includes(userRole)
      ) {
        return router.createUrlTree(['/']);
      }

      return true;
    })
  );
};
