import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { CityModel } from '@covid19-helpline/models';

export interface CityState {
  getCityInProcess: boolean;
  getCityInSuccess: boolean;
  cities: CityModel;
}

const initialState: CityState = {
  getCityInProcess: false,
  getCityInSuccess: false,
  cities: null,
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'allcities', resettable: true })
export class CityStore extends Store<CityState> {
  constructor() {
    super(initialState);
  }
}
