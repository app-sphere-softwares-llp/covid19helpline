import {Module} from '@nestjs/common';
import {environment} from '../environments/environment';
import {MongooseModule} from '@nestjs/mongoose';
import * as aws from 'aws-sdk';
import {SharedModule} from '../shared/shared.module';
import {AuthModule} from '../auth/auth.module';
import {UsersModule} from '../users/users.module';
import {CityModule} from "../city/city.module";
import {StateModule} from "../state/state.module";
import {ReasonModule} from "../reason/reason.module";
import {PassModule} from "../pass/pass.module";

// set db connection string on basis of environment
const dbConnectionString = environment.production ? process.env.DB_CONNECTION_STRING_PROD : process.env.DB_CONNECTION_STRING_DEV;

@Module({
  imports: [
    MongooseModule.forRoot(dbConnectionString, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    StateModule,
    CityModule,
    ReasonModule,
    PassModule
  ],
})
export class AppModule {
  constructor() {
    aws.config.update({
      region: 'ap-south-1',
      accessKeyId: process.env.AWS_ACCESSKEYID,
      secretAccessKey: process.env.AWS_SECRETACCESSKEY
    });
  }
}
