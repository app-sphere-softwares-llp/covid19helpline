import { Injectable } from '@angular/core';
import { BaseResponseModel, PassModel, User, StatusUpdateRequestModel } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
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
    return this._http.post(PassUrls.passDetails, json).pipe(
      map((res: BaseResponseModel<PassModel>) => {
        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }

  getRequests(json?: any) {
    return this._http.post(PassUrls.get, json).pipe(
      map((res: BaseResponseModel<PassModel[]>) => {
        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }


  createRequest(json:PassModel) {
    return this._http.post(PassUrls.create, json).pipe(
      map((res: BaseResponseModel<PassModel>) => {
        this.notification.success('Success', 'Request generated successfully');
        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }


  updateRequest(json: PassModel) {
    return this._http.post(PassUrls.updateStatus, json).pipe(
      map((res: BaseResponseModel<PassModel>) => {
        this.notification.success('Success', 'Request updated successfully');
        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }


  updateStatus(json: StatusUpdateRequestModel ) {
    return this._http.post(PassUrls.updateStatus, json).pipe(
      map((res: BaseResponseModel<User>) => {
        this.notification.success('Success', 'Request '+ json.status +' successfully');
         return res;
      }),
      catchError(err => {

        return this.handleError(err);
      })
    );
  }


}
