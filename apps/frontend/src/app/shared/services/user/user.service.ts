import { Injectable } from '@angular/core';
import { BasePaginatedResponse, BaseResponseModel, GetAllAdminUsersRequestModel, User } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { GeneralService } from '../general.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { Observable, of } from 'rxjs';
import { UserState, UserStore } from '../../../store/user/user.store';
import { UserUrls } from './user.url';

@Injectable()
export class UserService extends BaseService<UserStore, UserState> {

  constructor(protected userStore: UserStore, private _http: HttpWrapperService, private _generalService: GeneralService, private router: Router,
              protected notification: NzNotificationService) {
    super(userStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  getProfile() {
    this.updateState({ getUserProfileInProcess: true });
    return this._http.get(UserUrls.profile).pipe(
      map((res: BaseResponseModel<User>) => {
        this.updateState({
          getUserProfileInProcess: false,
          user: res.data,
        });
        return res;
      }),
      catchError(err => {
        this.updateState({
          getUserProfileInProcess: false,
          user: null,
        });
        return this.handleError(err);
      })
    );
  }

  getAllAdmin(json: GetAllAdminUsersRequestModel) {

    return this._http.post(UserUrls.getAllAdmin, json).pipe(
      map((res: BaseResponseModel<BasePaginatedResponse<User>>) => {

        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }


  createAdmin(json: User) {
    return this._http.post(UserUrls.createAdmin, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.notification.success('Success', res.data);
        return res;
      }),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  updateAdmin(json: any) {
    return this._http.post(UserUrls.updateAdmin, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.notification.success('Success', res.data);
        return res;
      }),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  deleteAdmin(json: any) {
    return this._http.post(UserUrls.deleteAdmin, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.notification.success('Success', res.data);
        return res;
      }),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

}
