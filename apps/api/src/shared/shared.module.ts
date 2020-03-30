import {Global, Module} from '@nestjs/common';
import {EasyconfigModule} from 'nestjs-easyconfig';
import * as path from 'path';
import {WinstonModule} from 'nest-winston';
import * as winston from 'winston';
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core';
import {ResponseInterceptor} from './interceptors/response.interceptor';
import {GenericExceptionFilter} from './exceptionFilters/generic.exceptionFilter';
import {GeneralService} from './services/general.service';
import {resolvePathHelper} from './helpers/helpers';
import {DbModule} from '../db/db.module';
import {UsersService} from './services/users/users.service';
import {ResetPasswordService} from './services/reset-password/reset-password.service';
import {EmailService} from './services/email/email.service';
import {AttachmentService} from './services/attachment/attachment.service';
import {SmsService} from './services/sms/sms.service';
import {StateService} from "./services/state/state.service";
import {CityService} from "./services/city/city.service";
import {ReasonService} from "./services/reason/reason.service";
import {HeaderResolver, I18nJsonParser, I18nModule} from "nestjs-i18n";

const providers = [
  GeneralService,
  UsersService,
  ResetPasswordService,
  EmailService,
  AttachmentService,
  SmsService,
  StateService,
  CityService,
  ReasonService
];

@Global()
@Module({
  imports: [
    EasyconfigModule.register({path: path.resolve(__dirname, '.env')}),
    WinstonModule.forRoot({
      level: 'error',
      transports: [
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint()
          ),
          filename: resolvePathHelper('error.log')
        })
      ]
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: resolvePathHelper('/i18n/'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-local-lang'])
      ]
    }),
    DbModule
  ],
  exports: [
    WinstonModule,
    DbModule,
    ...providers
  ],
  providers: [
    ...providers,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: GenericExceptionFilter
    }
  ]
})
export class SharedModule {

}
