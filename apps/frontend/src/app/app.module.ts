import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AppRoutingModule } from './app-routing.module';
import { TemplateModule } from './shared/template/template.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { CommonLayoutComponent } from './layouts/common-layout/common-layout.component';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';

import { NgChartjsModule } from 'ng-chartjs';
import { ThemeConstantService } from './shared/services/theme-constant.service';
import { MiddlewareComponent } from './middleware.component';
import { ServiceModule } from './shared/services/service.module';
import { AuthServiceConfig, GoogleLoginProvider, SocialLoginModule } from 'angularx-social-login';
import { environment } from '../environments/environment';

registerLocaleData(en);

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.googleApi)
  }
]);


export function provideConfig() {
  return config;
}

@NgModule({
    declarations: [
        AppComponent,
        CommonLayoutComponent,
        FullLayoutComponent,
        MiddlewareComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        AppRoutingModule,
        ServiceModule.forRoot(),
        TemplateModule,
        SharedModule,
        NgChartjsModule,
        SocialLoginModule
    ],
    providers: [
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
        {
          provide: AuthServiceConfig,
          useFactory: provideConfig
        },
        ThemeConstantService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
