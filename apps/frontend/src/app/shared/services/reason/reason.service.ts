import { Injectable } from '@angular/core';
import { BaseResponseModel, PassModel, ReasonModel, User } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { ReasonUrls } from './reason.url';
import { ReasonState, ReasonStore } from '../../../store/reason/reason.store';

@Injectable()
export class ReasonService extends BaseService<ReasonStore, ReasonState> {

  constructor(protected userStore: ReasonStore, private _http: HttpWrapperService,
              protected notification: NzNotificationService) {
    super(userStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  searchReason(json: any) {

    return this._http.post(ReasonUrls.get, json).pipe(
      map((res: BaseResponseModel<ReasonModel[]>) => {

        return res;
      }),
      catchError(err => {
        return this.handleError(err);
      })
    );
  }


}
