import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, Model, Types } from 'mongoose';
import { BaseService } from '../base.service';
import { GeneralService } from '../general.service';
import { DbCollection, User } from '@covid19-helpline/models';

@Injectable()
export class UsersService extends BaseService<User & Document> {

  constructor(@InjectModel(DbCollection.users) protected readonly _userModel: Model<User & Document>,
              private _generalService: GeneralService) {
    super(_userModel);

  }

  /**
   * create new user
   * @param user
   * @param session
   */
  async createUser(user: Partial<User & Document> | Array<Partial<User & Document>>, session: ClientSession) {
    return await this.create(user, session);
  }

  /**
   * update user
   * @param id
   * @param user
   * @param session
   */
  async updateUser(id: string, user: any, session?: ClientSession) {
    if (session) {
      return await this.updateById(id, user, session);
    } else {
      session = await this._userModel.db.startSession();
      session.startTransaction();

      try {
        const result = await this.updateById(id, user, session);
        await session.commitTransaction();
        session.endSession();
        return result;
      } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
      }
    }
  }

  /**
   * get user profile
   * @param id
   */
  async getUserProfile(id: string) {
    const userDetails: User = await this._userModel.findById(new Types.ObjectId(id)).lean();

    if (!userDetails) {
      throw new UnauthorizedException();
    }
    userDetails.id = userDetails._id;

    return userDetails;
  }

  /**
   * update user profile
   * @param model
   */
  async updateUserProfile(model: User) {
    // remove things which can not be updated
    delete model.emailId;
    delete model.password;
    delete model.username;
    delete model.status;
    delete model.lastLoginProvider;
  }
}
