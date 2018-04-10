import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';

import { AuthService } from '../services/auth.service';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // do stuff with response if you want
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401 || err.status === 403) {
                    if (err.url.indexOf('/login') < 0) {
                        alert('We have detected an unauthorized activity'); // need to find a NG way to resolve this!
                        this.authService.logout();
                    }
                }
                if (err.status === 500){
                    // Handle it how you want!
                    alert('Server Error Occoured! Please reload this page.');
                }
            }
        });
    }
}