import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { StateState, StateStore } from '../../store/state-city/state.store';


@Injectable({ providedIn: 'root' })
export class StateQuery extends Query<StateState> {
  states$ = this.select(s => s.states);

  constructor(protected store: StateStore) {
    super(store);
  }
}
