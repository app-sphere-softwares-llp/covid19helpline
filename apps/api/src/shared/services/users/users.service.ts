import {Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ClientSession, Document, Model} from 'mongoose';
import {BaseService} from '../base.service';
import {GeneralService} from '../general.service';
import {DbCollection, MemberTypes, MongooseQueryModel, User, UserStatus} from '@covid19-helpline/models';
import {UsersUtilityService} from "./users.utility.service";
import {ModuleRef} from "@nestjs/core";

@Injectable()
export class UsersService extends BaseService<User & Document> implements OnModuleInit {
  private _userUtilityService: UsersUtilityService;

  constructor(@InjectModel(DbCollection.users) protected readonly _userModel: Model<User & Document>,
              private _generalService: GeneralService, private _moduleRef: ModuleRef) {
    super(_userModel);

  }

  onModuleInit(): any {
    this._userUtilityService = new UsersUtilityService();
  }

  /**
   * create new user
   * @param user
   * @param session
   * @param isAdminUser
   */
  async createUser(user: User, session: ClientSession, isAdminUser: boolean = false) {

    // create user model
    const model = new User();
    model.mobileNumber = user.mobileNumber;
    model.username = model.mobileNumber;
    model.firstName = user.firstName;
    model.lastName = user.lastName;
    model.status = UserStatus.NotConfirmed;

    // if it's an admin user than add state id and city
    if (isAdminUser) {
      model.stateId = user.stateId;
      model.cityId = user.cityId;
      model.memberType = MemberTypes.admin;
    } else {
      model.memberType = MemberTypes.normal;
    }

    // create and return user
    return await this.create([model], session);
  }

  /**
   * create a admin user
   * @param user
   */
  async createAdminUser(user: User) {
    // check validations
    await this._userUtilityService.createAdminUserValidations(user, this._generalService.userType);

    // create admin process
    return this.withRetrySession(async (session: ClientSession) => {
      return await this.createUser(user, session, true);
    });
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
    // create query filter
    const queryFilter = new MongooseQueryModel();
    queryFilter.lean = true;
    queryFilter.populate = [{
      path: 'state',
      select: 'name',
      justOne: true
    }, {
      path: 'city',
      select: 'name',
      justOne: true
    }];

    // get user details
    const userDetails: User = await this.findById(id, queryFilter);

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
