import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '@interfaces/user';
import { AuthService } from '@services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = route => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuth().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        const currentUser = JSON.parse(
          localStorage.getItem('currentUser')!
        ) as User;
        const role = route.data['role'] as number[];

        if (Array.isArray(role) && currentUser.role >= 0) {
          const permissions = role.includes(currentUser.role);
          if (!permissions) {
            return router.createUrlTree(['']);
          }
          return permissions;
        } else {
          console.error('No role provided');
          router.navigate(['**']);
          return false;
        }
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
