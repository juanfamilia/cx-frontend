/** Base del API en el navegador: Vercel (y cualquier host real) → mismo origen + rewrite; solo localhost → Railway directo. */
export function apiBaseUrl(): string {
  const g = globalThis as typeof globalThis & { location?: { hostname?: string } };
  const host = typeof g.location?.hostname === 'string' ? g.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'https://siete-api-staging.up.railway.app/api/v1/';
  }
  return '/api/v1/';
}
