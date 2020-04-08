import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ClientSession, Document, Model} from 'mongoose';
import {BaseService} from '../base.service';
import {GeneralService} from '../general.service';
import {
  DbCollection,
  GetAllAdminUsersRequestModel,
  MemberTypes,
  MongooseQueryModel, SendSmsModel,
  User,
  UserStatus
} from '@covid19-helpline/models';
import {UsersUtilityService} from './users.utility.service';
import {ModuleRef} from '@nestjs/core';
import {BadRequest, toObjectId} from '../../helpers/helpers';
import {SmsService} from "../sms/sms.service";
import {DEFAULT_SMS_SENDING_OPTIONS} from "../../helpers/defaultValueConstant";
import {environment} from "../../../environments/environment";

/**
 * user sorting key mapper constant
 */
const USER_SORTING_MAPPER = new Map<string, string>([
  ['firstName', 'firstName'],
  ['lastName', 'lastName'],
  ['stateId', 'state.name'],
  ['state', 'state.name'],
  ['cityId', 'city.name'],
  ['city', 'city.name']
]);

@Injectable()
export class UsersService extends BaseService<User & Document>
  implements OnModuleInit {
  private _userUtilityService: UsersUtilityService;

  constructor(
    @InjectModel(DbCollection.users)
    protected readonly _userModel: Model<User & Document>,
    private _generalService: GeneralService,
    private _moduleRef: ModuleRef,
    private _smsService: SmsService
  ) {
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
  async createUser(
    user: User,
    session: ClientSession,
    isAdminUser: boolean = false
  ) {
    // create user model
    const model = new User();
    model.mobileNumber = user.mobileNumber;
    model.firstName = user.firstName;
    model.lastName = user.lastName;
    model.status = UserStatus.NotConfirmed;

    // if it's an admin user than add state id and city
    if (isAdminUser) {
      model.stateId = user.stateId;
      model.cityId = user.cityId;
      model.memberType = MemberTypes.admin;
      model.createdById = this._generalService.userId;
    } else {
      model.memberType = MemberTypes.normal;
    }

    // create and return user
    return await this.create([model], session);
  }

  /**
   * create a admin user
   * only super admin can create admin user
   * @param user
   */
  async createAdminUser(user: User) {
    // check validations
    await this._userUtilityService.createAdminUserValidations(user);

    // get user details
    const userDetails = await this.findOne({filter: {mobileNumber: user.mobileNumber}});
    // check if mobile number is already registered or not
    if (userDetails) {
      BadRequest('This mobile number is already registered');
    }

    // create admin process
    return this.withRetrySession(async (session: ClientSession) => {
      const adminUser = await this.createUser(user, session, true);

      // send otp to newly created admin user
      const smsModel = new SendSmsModel();
      smsModel.route = DEFAULT_SMS_SENDING_OPTIONS.route;
      smsModel.sender = DEFAULT_SMS_SENDING_OPTIONS.sender;
      smsModel.sms = [
        {
          to: [user.mobileNumber],
          message: `You have been registered as Admin Of Covid 19 Helpline app, please login here to get started
            ${environment.APP_URL}login
          `
        }
      ];

      this._smsService.sendSms(smsModel);
      return 'Admin user created Successfully';
    });
  }

  /**
   * update an admin user
   * only super admin can update a admin
   * @param user
   */
  async updateAdminUser(user: User) {
    if (!user || !user.id) {
      BadRequest('User not found');
    }

    // update user process
    return this.withRetrySession(async (session: ClientSession) => {
      const userDetails = await this.getUserDetails(user.id);

      // if current logged in user is not creator of this user than he can't update admin details
      if (userDetails.createdById.toString() !== this._generalService.userId) {
        BadRequest('Permission Denied');
      }

      // create update user model
      const userModel = new User();
      userModel.firstName = user.firstName;
      userModel.lastName = user.lastName;
      userModel.cityId = user.cityId;

      // update admin user by id
      await this.updateById(user.id, userModel, session);

      return 'Admin user updated Successfully';
    });
  }

  /**
   * get all admin users
   * only super admin can get all admins
   * @param model
   */
  async getAllAdminUsers(model: GetAllAdminUsersRequestModel) {
    const queryFilter: any = {
      $and: [
        {
          createdById: toObjectId(this._generalService.userId),
          isDeleted: false
        },
        {
          // set searching columns
          $or: [
            {
              firstName: {
                $regex: new RegExp(model.query.toString()),
                $options: 'i'
              }
            },
            {
              lastName: {
                $regex: new RegExp(model.query.toString()),
                $options: 'i'
              }
            },
            {
              mobileNumber: {
                $regex: new RegExp(model.query.toString()),
                $options: 'i'
              }
            }
          ]
        }
      ]
    };

    // check is valid key for sorting...
    if (model.sort) {
      model.sort = USER_SORTING_MAPPER.get(model.sort);

      if (!model.sort) {
        BadRequest('Invalid soring key');
      }
    } else {
      model.sort = 'firstName';
      model.sortBy = 'asc';
    }

    // fire get users query
    let users = await this.dbModel
      .aggregate()
      .match(queryFilter)
      .lookup({
        from: DbCollection.state,
        let: {stateId: '$stateId'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$stateId']}}},
          {$project: {name: 1}},
          {$addFields: {id: '$_id'}}
        ],
        as: 'state'
      })
      .unwind({path: '$state', preserveNullAndEmptyArrays: true})
      .lookup({
        from: DbCollection.city,
        let: {cityId: '$cityId'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$cityId']}}},
          {$project: {name: 1}},
          {$addFields: {id: '$_id'}}
        ],
        as: 'city'
      })
      .unwind({path: '$city', preserveNullAndEmptyArrays: true})
      .sort({[model.sort]: model.sortBy === 'asc' ? 1 : -1})
      .skip(model.count * model.page - model.count)
      .limit(model.count);

    // query for all counting all matched tasks
    const countQuery = await this.dbModel
      .aggregate()
      .match(queryFilter)
      .count('totalRecords');
    let totalRecordsCount = 0;
    if (countQuery && countQuery[0]) {
      totalRecordsCount = countQuery[0].totalRecords;
    }

    // map over users
    if (users && users.length) {
      users = users.map(user => {
        user.id = user._id;
        return user;
      });
    }

    // return paginated response
    return {
      page: model.page,
      totalItems: totalRecordsCount,
      totalPages: Math.ceil(totalRecordsCount / model.count),
      count: model.count,
      items: users
    };
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
    // get user details
    const userDetails: User = await this.getUserDetails(id, true);
    return userDetails;
  }

  /**
   * deletes an admin user
   * @param id
   */
  async deleteAdminUser(id: string) {
    return this.withRetrySession(async (session: ClientSession) => {
      const userDetails = await this.getUserDetails(id);

      await this.delete(id, session);
      return 'User deleted Successfully';
    });
  }

  /**
   * get user details
   * @param id
   * @param getFullDetails
   */
  public async getUserDetails(id: string, getFullDetails: boolean = false) {
    const userQuery = new MongooseQueryModel();
    userQuery.filter = {
      _id: id
    };
    userQuery.lean = true;

    // check if get full details is required
    if (getFullDetails) {
      userQuery.populate = [
        {
          path: 'state',
          select: 'name',
          justOne: true
        },
        {
          path: 'city',
          select: 'name',
          justOne: true
        },
        {
          path: 'createdBy',
          select: 'mobileNumber userName firstName lastName profilePic -_id',
          justOne: true
        }
      ];
    }

    // get use by id
    const userDetails = await this.findOne(userQuery);

    if (!userDetails) {
      // if user not found throw an error
      BadRequest('User not found');
    }

    // return user
    userDetails.id = userDetails._id;

    if (userDetails.state) {
      userDetails.state.id = userDetails.state._id;
    }

    if (userDetails.city) {
      userDetails.city.id = userDetails.city._id;
    }

    return userDetails;
  }
}
