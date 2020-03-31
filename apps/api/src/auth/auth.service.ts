import {BadRequestException, Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {ModuleRef} from '@nestjs/core';
import {BadRequest} from '../shared/helpers/helpers';
import {EmailService} from '../shared/services/email/email.service';
import {ResetPasswordService} from '../shared/services/reset-password/reset-password.service';
import {
  DbCollection,
  MongooseQueryModel,
  User,
  UserLoginWithPasswordRequest,
  UserStatus,
  VerifyOtpRequestModel
} from '@covid19-helpline/models';
import {UsersService} from '../shared/services/users/users.service';
import {OtpRequestService} from "../shared/services/otp-request/otp-request.service";

@Injectable()
export class AuthService implements OnModuleInit {
  private _userService: UsersService;
  private _resetPasswordService: ResetPasswordService;
  private _otpService: OtpRequestService;

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(DbCollection.users) private readonly _userModel: Model<User & Document>,
    private _emailService: EmailService, private _moduleRef: ModuleRef
  ) {
  }

  /**
   * on module init
   */
  onModuleInit(): void {
    this._userService = this._moduleRef.get('UsersService', {strict: false});
    this._resetPasswordService = this._moduleRef.get('ResetPasswordService', {strict: false});
    this._otpService = this._moduleRef.get('OtpRequestService', {strict: false});
  }

  /**
   * login with mobile
   * @param req
   */
  async login(req: UserLoginWithPasswordRequest) {
    // start session
    const session = await this._userModel.db.startSession();
    session.startTransaction();

    try {
      // get user by email id
      const user = await this._userModel.findOne({
        mobileNumber: req.mobileNumber
      }).exec();

      if (user) {
        // user is already login
        // create otp and send otp
        await this._otpService.createOtp(req.mobileNumber, session);

        // commit transaction
        await session.commitTransaction();
        session.endSession();

        return 'An otp sent to your mobile';
      } else {
        throw new UnauthorizedException('User not found');
      }
    } catch (e) {
      await session.abortTransaction();
      await session.endSession();
      throw e;
    }
  }

  /**
   * sign up
   * check basic validations
   * create jwt token and return it
   * @param user
   */
  async signUp(user: User) {
    // validations
    this.checkSignUpValidations(user);

    // start session
    const session = await this._userModel.db.startSession();
    session.startTransaction();

    try {
      // get user details by emailId id
      const userDetails = await this.getUserByMobileNo(user.mobileNumber);

      // user exist or not
      if (userDetails) {
        if (userDetails.status === UserStatus.Active) {
          BadRequest('Mobile no already in use');
        } else {
          // create otp and send otp
          await this._otpService.createOtp(user.mobileNumber, session);
        }
      } else {
        // create new user
        const model = new User();
        model.mobileNumber = user.mobileNumber;
        model.username = model.mobileNumber;
        model.firstName = user.firstName;
        model.lastName = user.lastName;
        model.status = UserStatus.NotConfirmed;

        // create new user
        await this._userService.create([model], session);

        // create otp and send otp
        await this._otpService.createOtp(model.mobileNumber, session);
      }

      // commit transaction
      await session.commitTransaction();
      session.endSession();
      return 'Otp sent successfully to your Mobile';
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  /**
   * verify otp
   * @param model
   */
  async verifyOtp(model: VerifyOtpRequestModel) {
    // start session
    const session = await this._userModel.db.startSession();
    session.startTransaction();
    try {
      await this._otpService.verifyOtp(model, session);
      const userDetails = await this.getUserByMobileNo(model.mobileNumber);

      // update user and set is active user
      await this._userService.updateById(userDetails.id, {$set: {status: UserStatus.Active}}, session);

      if (!userDetails) {
        BadRequest('User not found');
      }

      const jwtPayload = {sub: '', id: ''};

      jwtPayload.id = userDetails._id;
      jwtPayload.sub = userDetails.mobileNumber;

      // return jwt token
      return {
        access_token: this.jwtService.sign(jwtPayload)
      };
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  /**
   * resend otp
   * @param mobileNumber
   */
  async resendOtp(mobileNumber: string) {
    // start session
    const session = await this._userModel.db.startSession();
    session.startTransaction();

    try {
      const userDetails = await this.getUserByMobileNo(mobileNumber);

      if (!userDetails) {
        BadRequest('User not found');
      }

      // create otp and send otp
      await this._otpService.createOtp(mobileNumber, session);
      await session.commitTransaction();
      session.endSession();
      return 'An otp sent to your mobile';
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  /**
   * check basic sign up with password validations
   * @param user
   */
  private checkSignUpValidations(user: User) {
    // check first name
    if (!user.mobileNumber) {
      throw new BadRequestException('Mobile Number is mandatory');
    }

    // check first name
    if (!user.firstName) {
      throw new BadRequestException('First Name is mandatory');
    }

    // check last name
    if (!user.lastName) {
      throw new BadRequestException('last Name is mandatory');
    }
  }

  /**
   * get user by mobile no
   * @param mobileNumber
   */
  private async getUserByMobileNo(mobileNumber: string) {
    const userQuery = new MongooseQueryModel();
    userQuery.filter = {
      mobileNumber
    };
    userQuery.select = '_id mobileNumber';
    userQuery.lean = true;

    const userDetails = await this._userService.findOne(userQuery);
    if (userDetails) {
      userDetails.id = userDetails._id;
    }
    return userDetails;
  }
}

