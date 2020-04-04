import { Injectable } from '@angular/core';
import { AuthState, AuthStore } from '../../store/auth/auth.store';
import {
  BaseResponseModel,
  User,
  UserLoginProviderEnum,
  UserLoginSignUpSuccessResponse,
  VerifyOtpRequestModel
} from '@covid19-helpline/models';
import { BaseService } from './base.service';
import { HttpWrapperService } from './httpWrapper.service';
import { AuthUrls } from './apiUrls/auth.url';
import { catchError, map } from 'rxjs/operators';
import { GeneralService } from './general.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { of } from 'rxjs';
import { UserStore } from '../../store/user/user.store';
import { AuthService as SocialAuthService } from 'angularx-social-login';

@Injectable()
export class AuthService extends BaseService<AuthStore, AuthState> {

  constructor(protected authStore: AuthStore, private _http: HttpWrapperService, private _generalService: GeneralService, private router: Router,
              protected notification: NzNotificationService, protected userStore: UserStore, private socialAuthService: SocialAuthService) {
    super(authStore, notification);
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  login(json: User) {
    this.updateState({ isLoginInProcess: true, isLoginSuccess: false, token: null });
    return this._http.post(AuthUrls.login, json).pipe(
      map((res: BaseResponseModel<string>) => {

        this.updateState({
          isLoginInProcess: false,
          isLoginSuccess: true,
          token: null
        });

        this.notification.success('Success', res.data);

        return res;
      }),
      catchError(err => {
        this.updateState({
          isLoginSuccess: false,
          isLoginInProcess: false,
          token: null
        });

        this._generalService.token = null;

        return this.handleError(err);
      })
    );
  }

  register(json: User) {
    this.updateState({ isSignupInProcess: true, isSignupSuccess: false });
    return this._http.post(AuthUrls.register, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.updateState({ isSignupSuccess: true, isSignupInProcess: false });
        this.notification.success('Success', res.data);
        return res;
      }),
      catchError((err) => {
        this.updateState({ isSignupSuccess: false, isSignupInProcess: false });
        this._generalService.token = null;

        return this.handleError(err);
      })
    );
  }

  verifyOtp(json: VerifyOtpRequestModel) {
    this.updateState({ isVerificationInProcess: true, isVerificationInSuccess: false });
    return this._http.post(AuthUrls.verifyOtp, json).pipe(
      map((res: BaseResponseModel<UserLoginSignUpSuccessResponse>) => {

        this.updateState({
          isVerificationInSuccess: true,
          isVerificationInProcess: false,
          token: res.data.access_token
        });

        this._generalService.token = res.data.access_token;
        this.router.navigate(['dashboard']);

        return res;
      }),
      catchError((err) => {
        this.updateState({
          isVerificationInSuccess: false,
          isVerificationInProcess: false,
          token: null
        });

        this._generalService.token = null;

        return this.handleError(err);
      })
    );
  }

  resendOtp(json: User) {
    this.updateState({ isResendInProcess: true, isResendInSuccess: false });
    return this._http.post(AuthUrls.resendOtp, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.notification.success('Success', res.data);
        this.updateState({
          isResendInProcess: false,
          isResendInSuccess: true,
          token: null
        });
        return res;
      }),
      catchError((err) => {

        this.updateState({
          isResendInProcess: false,
          isResendInSuccess: false,
          token: null
        });

        return this.handleError(err);
      })
    );
  }


  createAdmin(json: User) {
    return this._http.post(AuthUrls.createAdmin, json).pipe(
      map((res: BaseResponseModel<string>) => {
        this.notification.success('Success', res.data);
        return res;
      }),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }


  logOut() {
    // if login from social user then please logout from social platforms
    if (this._generalService.user && this._generalService.user.lastLoginProvider === UserLoginProviderEnum.google) {
      // sign out from google then do normal logout process
      this.socialAuthService.signOut(true).then(() => {
        this.doLogout();
      }).catch(err => {
        console.log(err);
      });
    } else {
      // normal login
      this.doLogout();
    }
  }

  private doLogout() {
    this.updateState({ token: null });
    this.userStore.update((state) => {
      return {
        ...state,
        user: null,
      };
    });
    this.router.navigate(['/login']);
  }

  googleSignIn(token: string, invitationId?: string) {
    this.updateState({ token: null, isLoginInProcess: true, isLoginSuccess: false });
    return this._http.post(AuthUrls.googleSignIn, { token, invitationId }).pipe(
      map((res: BaseResponseModel<UserLoginSignUpSuccessResponse>) => {
        this.updateState({
          isLoginSuccess: true,
          isLoginInProcess: false,
          token: res.data.access_token
        });

        this._generalService.token = res.data.access_token;
        this.router.navigate(['dashboard']);
        return res;
      }),
      catchError(err => {
        this.updateState({
          isLoginSuccess: false,
          isLoginInProcess: false,
          token: null
        });


        this._generalService.token = null;
        return this.handleError(err);
      })
    );
  }
}
