import { apiBaseUrl } from './api-base';

export const environment = {
  production: false,
  get apiUrl() {
    return apiBaseUrl();
  },
};
