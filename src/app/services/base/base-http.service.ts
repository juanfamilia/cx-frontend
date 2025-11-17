import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

/**
 * Base HTTP Service - Enterprise Grade
 * 
 * Proporciona métodos estandarizados para todas las operaciones HTTP
 * con manejo de errores, logging y construcción de URLs consistente.
 * 
 * @author Siete CX Platform
 * @version 2.0
 */
@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  protected http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  /**
   * Construye una URL completa desde el endpoint base
   * Asegura que siempre haya un slash entre baseUrl y el path
   * 
   * @param path - Ruta del endpoint (sin slash inicial)
   * @param trailingSlash - Si debe añadir slash al final (default: false)
   * @returns URL completa formateada correctamente
   * 
   * @example
   * buildUrl('users') // returns 'https://api.com/api/v1/users'
   * buildUrl('users', true) // returns 'https://api.com/api/v1/users/'
   */
  protected buildUrl(path: string, trailingSlash = false): string {
    // Remover slashes del inicio y final del path
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    
    // Construir URL base
    const url = `${this.baseUrl}/${cleanPath}`;
    
    // Añadir trailing slash si se requiere
    return trailingSlash ? `${url}/` : url;
  }

  /**
   * Construye HttpParams desde un objeto
   * Filtra valores null y undefined automáticamente
   * 
   * @param params - Objeto con parámetros de query
   * @returns HttpParams configurado
   */
  protected buildHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return httpParams;
  }

  /**
   * GET request con manejo de errores
   */
  protected get<T>(
    path: string,
    params?: Record<string, any>,
    trailingSlash = false
  ): Observable<T> {
    const url = this.buildUrl(path, trailingSlash);
    const httpParams = this.buildHttpParams(params);
    
    return this.http.get<T>(url, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request con manejo de errores
   */
  protected post<T>(
    path: string,
    body: any,
    trailingSlash = false
  ): Observable<T> {
    const url = this.buildUrl(path, trailingSlash);
    
    return this.http.post<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request con manejo de errores
   */
  protected put<T>(
    path: string,
    body: any,
    trailingSlash = false
  ): Observable<T> {
    const url = this.buildUrl(path, trailingSlash);
    
    return this.http.put<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request con manejo de errores
   */
  protected delete<T>(
    path: string,
    trailingSlash = false
  ): Observable<T> {
    const url = this.buildUrl(path, trailingSlash);
    
    return this.http.delete<T>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ HTTP Error:', error);
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.message}`;
      
      if (error.error?.detail) {
        errorMessage = error.error.detail;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Log de debug en desarrollo
   */
  protected log(message: string, data?: any): void {
    if (!environment.production) {
      console.log(`🔍 [${this.constructor.name}] ${message}`, data || '');
    }
  }
}
