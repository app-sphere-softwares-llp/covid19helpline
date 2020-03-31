import { Injectable } from '@angular/core';
import { BaseResponseModel, User } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { GeneralService } from '../general.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { UserState, UserStore } from '../../../store/user/user.store';
import { PassUrls } from './pass.url';

@Injectable()
export class PassService extends BaseService<UserStore, UserState> {

  constructor(protected userStore: UserStore, private _http: HttpWrapperService,
              protected notification: NzNotificationService) {
    super(userStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  getRequestById(json: any) {
    return this._http.post(PassUrls.create, json).pipe(
      map((res: BaseResponseModel<User>) => {
        return res;
      }),
      catchError(err => {
        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }


  createRequest(json:any) {
    return this._http.post(PassUrls.create, json).pipe(
      map((res: BaseResponseModel<User>) => {
        return res;
      }),
      catchError(err => {
        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }

  updateRequest(json: any) {
    return this._http.post(PassUrls.update, json).pipe(
      map((res: BaseResponseModel<User>) => {
        return res;
      }),
      catchError(err => {
        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }

  rejectRequest(json: any) {
    return this._http.post(PassUrls.reject, json).pipe(
      map((res: BaseResponseModel<User>) => {
        return res;
      }),
      catchError(err => {
        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }

  approveRequest(json: any) {
    return this._http.post(PassUrls.approve, json).pipe(
      map((res: BaseResponseModel<User>) => {
         return res;
      }),
      catchError(err => {
        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }


}
