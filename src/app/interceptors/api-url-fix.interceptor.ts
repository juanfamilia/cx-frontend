import { HttpInterceptorFn } from '@angular/common/http';

/**
 * CRITICAL FIX: Force correct API URL for production
 * This interceptor replaces any old/incorrect API URLs with the correct Railway backend URL
 */
export const apiUrlFixInterceptor: HttpInterceptorFn = (req, next) => {
  const CORRECT_API_URL = 'https://cx-api.sieteic.com/api/v1';
  const OLD_API_URL = 'https://romantic-charm-staging.up.railway.app/api/v1';
  
  // If request URL contains the old API URL, replace it
  if (req.url.includes(OLD_API_URL)) {
    const correctedUrl = req.url.replace(OLD_API_URL, CORRECT_API_URL);
    const correctedReq = req.clone({
      url: correctedUrl
    });
    console.log('🔧 API URL FIXED:', OLD_API_URL, '→', CORRECT_API_URL);
    return next(correctedReq);
  }
  
  return next(req);
};
