import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbCollection } from '@covid19-helpline/models';
import { userSchema } from './schemas/users.schema';
import { resetPasswordSchema } from './schemas/reset-password.schema';
import { attachmentSchema } from './schemas/attachment.schema';


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
    }])
  ],
  exports: [
    MongooseModule
  ]
})
export class DbModule {

}
