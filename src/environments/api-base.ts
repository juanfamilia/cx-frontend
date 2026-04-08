/**
 * Base del API en el navegador (siempre Railway en este proyecto).
 * El rewrite `/api` → Railway en Vercel a veces no se aplica con el build de Angular;
 * entonces `/api/v1/...` devolvía HTML del SPA y HttpClient fallaba al parsear JSON.
 * El backend permite orígenes Vercel y localhost en CORS.
 */
const API_V1_BASE = 'https://siete-api-staging.up.railway.app/api/v1/';

export function apiBaseUrl(): string {
  return API_V1_BASE;
}
