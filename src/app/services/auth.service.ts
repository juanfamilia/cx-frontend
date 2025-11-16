import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';

import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Login, LoginResponse } from '@interfaces/login';
import { User } from '@interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private router = inject(Router);

  loggedIn = signal<boolean>(false);

  login(data: Login): Observable<LoginResponse> {
    // Agregamos esto para depurar
    console.log('🔍 DEBUG - API URL:', environment.apiUrl);
    console.log('🔍 DEBUG - URL completa:', environment.apiUrl + 'auth/login');
    console.log('🔍 DEBUG - Environment completo:', environment);
    
    const body = `grant_type=password&username=${encodeURIComponent(data.username)}&password=${encodeURIComponent(data.password)}&scope=&client_id=&client_secret=`;
    return this.http.post<LoginResponse>(
      environment.apiUrl + '/auth/login',
      body,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        // withCredentials: true,  // Comentado temporalmente para pruebas con CORS "*"
      }
    );
  }


  logout() {
    localStorage.removeItem('currentUser');
    this.cookieService.delete('access_token');
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }

  isAuth(): Observable<boolean> {
    const isToken = this.cookieService.check('access_token');
    const currentUser = localStorage.getItem('currentUser');

    if (!isToken || currentUser === null) {
      this.loggedIn.set(false);
      return of(false);
    }

    const token = this.cookieService.get('access_token');

    if (this.isAccessTokenExpired(token)) {
      this.loggedIn.set(false);
      this.logout();
      return of(false);
    }

    this.loggedIn.set(true);
    return of(true);
  }

  isAccessTokenExpired(token: string): boolean {
    try {
      const tokenDecoded = jwtDecode<JwtPayload>(token);
      const tokenExpirationDate = new Date(tokenDecoded.exp! * 1000);
      return Date.now() >= tokenExpirationDate.getTime();
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  setCredentials(token: string, user: User) {
    const tokenDecoded = jwtDecode<JwtPayload>(token);
    const tokenExpiration = new Date(tokenDecoded.exp! * 1000);

    this.cookieService.set('access_token', token, {
      expires: tokenExpiration,
      path: '/',
    });

    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User {
    const currentUser = JSON.parse(
      localStorage.getItem('currentUser')!
    ) as User;
    return currentUser;
  }
}
