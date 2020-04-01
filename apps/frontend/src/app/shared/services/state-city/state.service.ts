import { Injectable } from '@angular/core';
import { BaseResponseModel, StateModel } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { StateCityUrls } from './state-city.url';
import { StateState, StateStore } from '../../../store/state-city/state.store';

@Injectable()
export class StateService extends BaseService<StateStore, StateState> {

  constructor(protected StateStore: StateStore, private _http: HttpWrapperService,
              protected notification: NzNotificationService) {
    super(StateStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  getStates() {

    this.updateState({ states: [],  getStateInProcess: true, getStateInSuccess: false });

    return this._http.post(StateCityUrls.getAllStates, {} ).pipe(
      map((res: BaseResponseModel<StateModel[]>) => {
        this.updateState({ states: res.data, getStateInProcess: false, getStateInSuccess: true });
        return res;
      }),
      catchError(err => {

        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }


}
