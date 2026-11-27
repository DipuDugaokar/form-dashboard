import { HttpInterceptorFn } from '@angular/common/http';

// Session cookies are expected to be HttpOnly and issued by the backend.
// Never put passwords, access tokens, or database credentials in localStorage.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
