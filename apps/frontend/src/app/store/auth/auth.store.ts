
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';


export interface AuthState {
  isLoginInProcess: boolean;
  isLoginSuccess: boolean;
  isSignupInProcess: boolean;
  isSignupSuccess: boolean;
  isVerificationInProcess: boolean,
  isVerificationInSuccess: boolean,
  isResendInProcess: boolean,
  isResendInSuccess: boolean,
  token: string;
}

const initialState: AuthState = {
  isLoginInProcess: false,
  isLoginSuccess: false,
  isSignupInProcess: false,
  isSignupSuccess: false,
  isVerificationInProcess: false,
  isVerificationInSuccess: false,
  isResendInProcess: false,
  isResendInSuccess: false,
  token: null,
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth', resettable: true })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialState);
  }
}
