import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {DbCollection} from '@covid19-helpline/models';
import {userSchema} from './schemas/users.schema';
import {resetPasswordSchema} from './schemas/reset-password.schema';
import {attachmentSchema} from './schemas/attachment.schema';
import {stateSchema} from "./schemas/state.schema";
import {citySchema} from "./schemas/city.schema";
import {passSchema} from "./schemas/pass.schema";
import {reasonSchema} from "./schemas/reason.schema";
import {otpRequestSchema} from "./schemas/otp-request.schema";


@Module({
  imports: [
    MongooseModule.forFeature([{
      name: DbCollection.users,
      schema: userSchema,
      collection: DbCollection.users
    }, {
      name: DbCollection.resetPassword,
      schema: resetPasswordSchema,
      collection: DbCollection.resetPassword
    }, {
      name: DbCollection.attachments,
      schema: attachmentSchema,
      collection: DbCollection.attachments
    }, {
      name: DbCollection.state,
      schema: stateSchema,
      collection: DbCollection.state
    }, {
      name: DbCollection.city,
      schema: citySchema,
      collection: DbCollection.city
    }, {
      name: DbCollection.pass,
      schema: passSchema,
      collection: DbCollection.pass
    }, {
      name: DbCollection.reason,
      schema: reasonSchema,
      collection: DbCollection.reason
    }, {
      name: DbCollection.otpRequest,
      schema: otpRequestSchema,
      collection: DbCollection.otpRequest
    }])
  ],
  exports: [
    MongooseModule
  ]
})
export class DbModule {

}
