import {HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthInterceptor {

  // Intercept all HTTP requests and add the Bearer token to the header. This saves the complexity of adding it to every request manually.
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = '9bAqXRPplyiGfF6n81NVUGpAqeLI1QHw46aqICVL1BLaGI6';

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ` + token,
        AccessControlAllowOrigin: '*'
      }
    });

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      // Something went wrong
      catchError((error: HttpErrorResponse) => {
          return throwError(error);
      }));
  }
}
