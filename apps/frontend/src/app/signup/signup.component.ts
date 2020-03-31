import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { AuthQuery } from '../queries/auth/auth.query';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AuthService as SocialAuthService, GoogleLoginProvider } from 'angularx-social-login';


@Component({
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})

export class SignupComponent implements OnInit, OnDestroy {
  public signUpForm: FormGroup;
  public otpForm: FormGroup;

  public signupInProcess = false;
  public isSubmitted: boolean;

  constructor(private _authService: AuthService,
              private _authQuery: AuthQuery,
              private router: Router,
              private socialAuthService: SocialAuthService) {
  }

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      mobile: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required])
    });

    this.otpForm = new FormGroup({
      otp: new FormControl(null, [Validators.required])
    });

    this._authQuery.isLoginInProcess$.pipe(untilDestroyed(this)).subscribe(res => {
      this.signupInProcess = res;
    });

    // this._authQuery.isSignupSuccess$.pipe(untilDestroyed(this)).subscribe(res => {
    //   if (this.isSubmitted && !res) {
    //     this.responseMessage.message = 'Invalid credentials';
    //     this.responseMessage.type = 'danger';
    //   }
    // });

    // auth state subscriber if user and user token found then verify that token and re-login user
    this.socialAuthService.authState.pipe(untilDestroyed(this)).subscribe((user) => {
      if (user) {
        this._authService.googleSignIn(user.idToken).subscribe();
      }
    });

  }

  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(result => {
    }).catch(err => {
      console.log(err);
    });
  }

  submitForm() {
    this.isSubmitted = true;
    //this._authService.login(this.loginForm.value).subscribe();
  }

  submitOTP() {
    this.isSubmitted = false;
    //this._authService.login(this.loginForm.value).subscribe();
  }

  ngOnDestroy(): void {
  }
}
