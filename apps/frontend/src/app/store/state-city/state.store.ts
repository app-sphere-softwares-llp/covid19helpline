import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { StateModel } from '@covid19-helpline/models';

export interface StateState {
  getStateInProcess: boolean;
  getStateInSuccess: boolean;
  states: StateModel[];
}

const initialState: StateState = {
  getStateInProcess: false,
  getStateInSuccess: false,
  states: null,
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'allstates', resettable: true })
export class StateStore extends Store<StateState> {
  constructor() {
    super(initialState);
  }
}
