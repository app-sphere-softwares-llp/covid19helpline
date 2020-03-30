import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {DbCollection} from '@covid19-helpline/models';
import {userSchema} from './schemas/users.schema';
import {resetPasswordSchema} from './schemas/reset-password.schema';
import {attachmentSchema} from './schemas/attachment.schema';
import {stateSchema} from "./schemas/state.schema";
import {citySchema} from "./schemas/city.schema";
import {getPassSchema} from "./schemas/get-pass.schema";
import {reasonSchema} from "./schemas/reason.schema";


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
      name: DbCollection.getPass,
      schema: getPassSchema,
      collection: DbCollection.getPass
    }, {
      name: DbCollection.reason,
      schema: reasonSchema,
      collection: DbCollection.reason
    }])
  ],
  exports: [
    MongooseModule
  ]
})
export class DbModule {

}
