import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { AuthQuery } from '../queries/auth/auth.query';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AuthService as SocialAuthService, GoogleLoginProvider } from 'angularx-social-login';
import { NzNotificationService } from 'ng-zorro-antd';
import { User } from '@covid19-helpline/models';


@Component({
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})

export class SignupComponent implements OnInit, OnDestroy {
  public signUpForm: FormGroup;
  public otpForm: FormGroup;
  public mobileNumber:string;

  public resendInProcess: boolean;
  public resendInProcessWaitTime: number;
  public interval: any;
  public signupInProcess: boolean;
  public signupIsSuccess: boolean;
  public verificationInProcess: boolean;
  public isSubmitted: boolean;
  public isSubmittedOtp: boolean;
  public otpSendingInProcess: boolean;

  constructor(private _authService: AuthService,
              private _authQuery: AuthQuery,
              private router: Router,
              protected notification: NzNotificationService,
              private socialAuthService: SocialAuthService) {
  }

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      mobileNumber: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required])
    });

    this.otpForm = new FormGroup({
      mobileNumber: new FormControl(null, [Validators.required]),
      code: new FormControl(null, [Validators.required])
    });

    this._authQuery.isSignupInProcess$.pipe(untilDestroyed(this)).subscribe(res => {
      this.signupInProcess = res;
    });

    this._authQuery.isVerificationInProcess$.pipe(untilDestroyed(this)).subscribe(res => {
      this.verificationInProcess = res;
    });

    this._authQuery.isSignupSuccess$.pipe(untilDestroyed(this)).subscribe(res => {
      if (this.isSubmitted && res) {
        this.signupIsSuccess = true;
        this.startTimer(60);
      }
    });

    this._authQuery.isResendInProcess$.pipe(untilDestroyed(this)).subscribe(res => {
      this.resendInProcess = res;
    });

    this._authQuery.isResendInSuccess$.pipe(untilDestroyed(this)).subscribe(res => {
        if (res) {
          this.startTimer(60);
        }
    });


    // auth state subscriber if user and user token found then verify that token and re-login user
    // this.socialAuthService.authState.pipe(untilDestroyed(this)).subscribe((user) => {
    //   if (user) {
    //     this._authService.googleSignIn(user.idToken).subscribe();
    //   }
    // });

  }

  // loginWithGoogle() {
  //   this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(result => {
  //   }).catch(err => {
  //     console.log(err);
  //   });
  // }

  public submitForm() {
    try {

      this.isSubmitted = true;

      this.otpForm.get('mobileNumber').patchValue(this.signUpForm.value.mobileNumber);

      this._authService.register(this.signUpForm.value).subscribe();

    }catch (e) {
      this.isSubmitted = false;
    }
  }

  public submitOTP() {
    try {
      this.isSubmittedOtp = true;

      console.log(this.otpForm.value);

      this._authService.verifyOtp(this.otpForm.value).subscribe();

    }catch (e) {
      this.isSubmittedOtp = false;
    }
  }



  public resendOtp() {
    try {
      this.otpSendingInProcess =true;

      const json : User = {
         mobileNumber: this.otpForm.get('mobileNumber').value
      }

      this._authService.resendOtp(json).subscribe();

    }catch (e) {
      this.otpSendingInProcess =false;
    }
  }


  // if otp fields start filling the sms message will hide
  public checkField() {
    if (this.otpForm.get('code').value.length > 0) {
      this.resendInProcessWaitTime = 0;
      console.log('clearInterval/stopped: ', this.resendInProcessWaitTime);
      clearInterval(this.interval); // stop interval tick
    }
  }

  public startTimer(durationInSec: number) {
    this.resendInProcessWaitTime = durationInSec;

    this.interval = setInterval(() => {
      console.log(this.resendInProcessWaitTime);

      this.resendInProcessWaitTime--;

      if (this.resendInProcessWaitTime === 0) {
        console.log('clearInterval/stopped: ', this.resendInProcessWaitTime);
        clearInterval(this.interval); // stop interval tick
      }
    }, 1000);
  }

  ngOnDestroy(): void {
  }
}
