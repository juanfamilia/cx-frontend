import { apiBaseUrl } from './api-base';

/** Getter: se evalúa en el navegador (evita que el build en Node fije la base y rompa localhost con `ng serve --configuration production`). */
export const environment = {
  production: true,
  get apiUrl() {
    return apiBaseUrl();
  },
};
