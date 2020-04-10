import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {GeneralService} from '../services/general.service';
import * as moment from 'moment';
import {BaseResponseModel} from '@covid19-helpline/models';
import {environment} from "../../environments/environment";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponseModel<T>> {

  constructor(private readonly _generalService: GeneralService) {
  }

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> | Promise<Observable<any>> {
    return next.handle()
      .pipe(
        map(resp => {
          const http = context.switchToHttp();
          const request = http.getRequest();
          const headers = request.headers;
          const excludedRoutes = ['public/check-pass'];

          // set locale based on request header from browser
          this._generalService.locale = headers['accept-language'];
          moment.locale(this._generalService.locale);

          // check if route is excluded or not
          const isExcludedRoute = excludedRoutes.some(route => {
            return request.url.includes(route);
          });

          if (isExcludedRoute) {
            return resp;
          } else {
            const newResponse = new BaseResponseModel<T>();
            newResponse.data = resp;
            newResponse.hasError = false;
            newResponse.errors = null;
            return newResponse;
          }
        })
      );
  }
}
