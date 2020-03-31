import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthState, AuthStore } from '../../store/auth/auth.store';


@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  isLoginInProcess$ = this.select(s => s.isLoginInProcess);
  isLoginSuccess$ = this.select(s => s.isLoginSuccess);
  isSignupInProcess$ = this.select(s => s.isSignupInProcess);
  isSignupSuccess$ = this.select(s => s.isSignupSuccess);
  isVerificationInProcess$ = this.select(s => s.isVerificationInProcess);
  isVerificationInSuccess$ = this.select(s => s.isVerificationInSuccess);
  isResendInProcess$ = this.select(s => s.isResendInProcess);
  isResendInSuccess$ = this.select(s => s.isResendInSuccess);
  token$ = this.select(s => s.token);

  constructor(protected store: AuthStore) {
    super(store);
  }
}
