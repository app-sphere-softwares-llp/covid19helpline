import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CityState, CityStore } from '../../store/state-city/city.store';


@Injectable({ providedIn: 'root' })
export class CityQuery extends Query<CityState> {
  cities$ = this.select(s => s.cities);

  constructor(protected store: CityStore) {
    super(store);
  }
}
