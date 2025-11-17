import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Error Handler Interceptor - Enterprise Grade
 * 
 * Maneja todos los errores HTTP de forma centralizada:
 * - Errores 401: Redirige al login
 * - Errores 403: Muestra mensaje de permisos
 * - Errores 404: Log específico
 * - Errores 500+: Log de servidor
 * 
 * @author Siete CX Platform
 * @version 2.0
 */
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
        console.error('❌ Client-side Error:', error.error.message);
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            console.error('❌ Network Error: Cannot reach server');
            break;
          
          case 401:
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            console.error('❌ Unauthorized (401): Redirecting to login');
            // Note: Don't redirect here, let auth guard handle it
            break;
          
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            console.error('❌ Forbidden (403): Insufficient permissions');
            break;
          
          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            console.error('❌ Not Found (404):', req.url);
            break;
          
          case 422:
            errorMessage = 'Los datos enviados no son válidos.';
            console.error('❌ Validation Error (422):', error.error);
            break;
          
          case 500:
          case 502:
          case 503:
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
            console.error(`❌ Server Error (${error.status}):`, error.message);
            break;
          
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
            console.error(`❌ HTTP Error (${error.status}):`, error);
        }

        // Si hay un mensaje específico del servidor, usarlo
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }

      // Log completo del error en desarrollo
      if (typeof window !== 'undefined' && !(window as any)['__isProduction__']) {
        console.group('🔍 Error Details');
        console.log('URL:', req.url);
        console.log('Method:', req.method);
        console.log('Status:', error.status);
        console.log('Error:', error);
        console.groupEnd();
      }

      // Retornar el error para que los servicios puedan manejarlo
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
