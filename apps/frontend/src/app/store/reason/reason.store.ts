import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { ReasonModel } from '@covid19-helpline/models';

export interface ReasonState {
  getReasonInProcess: boolean;
  getReasonInSuccess: boolean;
  reasons: ReasonModel[];
}

const initialState: ReasonState = {
  getReasonInProcess: false,
  getReasonInSuccess: false,
  reasons: null,
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'reasons', resettable: true })
export class ReasonStore extends Store<ReasonState> {
  constructor() {
    super(initialState);
  }
}

