import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { ShareToasterService } from '@services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);
  const toastService = inject(ShareToasterService);

  const addToken = (request: HttpRequest<unknown>) => {
    const token = cookieService.get('access_token');
    return token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;
  };

  // Excluir la solicitud de renovación del interceptor
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  return next(addToken(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        toastService.showToast(
          'Warning',
          'Su sesión ha expirado',
          'Por favor, inicie sesión nuevamente'
        );
      }
      return throwError(() => error);
    })
  );
};
