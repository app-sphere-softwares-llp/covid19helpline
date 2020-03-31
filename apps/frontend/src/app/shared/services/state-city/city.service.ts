import { Injectable } from '@angular/core';
import { BaseResponseModel, CityModel, CityRequestModel } from '@covid19-helpline/models';
import { BaseService } from '../base.service';
import { HttpWrapperService } from '../httpWrapper.service';
import { catchError, map } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { StateCityUrls } from './state-city.url';
import { CityStore, CityState } from '../../../store/state-city/city.store';

@Injectable()
export class CityService extends BaseService<CityStore, CityState> {

  constructor(protected CityStore: CityStore, private _http: HttpWrapperService,
              protected notification: NzNotificationService) {
    super(CityStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }


  getCities(json: CityRequestModel ) {

    // this.updateState({ cities: [],  getStateInProcess: true, getStateInSuccess: false });

    return this._http.post(StateCityUrls.getCities, json ).pipe(
      map((res: BaseResponseModel<CityModel[]>) => {
        // this.updateState({ cities: res.data,  getStateInProcess: true, getStateInSuccess: false });
        return res;
      }),
      catchError(err => {

        this.notification.error('Error', err.error.error.message);
        return of(err);
      })
    );
  }


}
