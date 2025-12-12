// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router);

  const allowedRoles = route.data['role'] as number[] | undefined;

  const isLoggedIn = authService.loggedIn();
  let userRole: number | undefined = undefined;

  if (isLoggedIn) {
    try {
      const user = authService.getCurrentUser();
      // ajusta si tu interfaz User usa otra propiedad
      userRole = (user as any).role as number | undefined;
    } catch {
      // si falla currentUser, se trata como no logueado
    }
  }

  if (!isLoggedIn) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (allowedRoles && userRole != null && !allowedRoles.includes(userRole)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
