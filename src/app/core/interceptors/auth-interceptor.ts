import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../../features/auth/services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const authToken = authService.token();
  const authRequest = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });
  return next(authRequest);
};
