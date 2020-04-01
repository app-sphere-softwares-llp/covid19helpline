import {BadRequestException, Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {InjectModel} from '@nestjs/mongoose';
import {ClientSession, Document, Model} from 'mongoose';
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
import {BaseService} from "../shared/services/base.service";

@Injectable()
export class AuthService extends BaseService<User & Document> implements OnModuleInit {
  private _userService: UsersService;
  private _resetPasswordService: ResetPasswordService;
  private _otpService: OtpRequestService;

  constructor(
    @InjectModel(DbCollection.users) protected readonly _userModel: Model<User & Document>,
    private readonly jwtService: JwtService, private _emailService: EmailService, private _moduleRef: ModuleRef
  ) {
    super(_userModel);
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
    return this.withRetrySession(async (session: ClientSession) => {
      // get user by email id
      const user = await this._userModel.findOne({
        mobileNumber: req.mobileNumber
      }).exec();

      if (user) {
        // user is already exists
        // create otp and send otp
        await this._otpService.createOtp(req.mobileNumber, session);
        return 'An otp sent to your mobile';
      } else {
        throw new UnauthorizedException('User not found');
      }
    });
  }

  /**
   * sign up
   * check basic validations
   * create jwt token and return it
   * @param user
   */
  async signUp(user: User) {
    return this.withRetrySession(async (session: ClientSession) => {
      // validations
      this.checkSignUpValidations(user);

      // get user details by emailId id
      const userDetails = await this.getUserByMobileNo(user.mobileNumber);

      // user exist or not
      if (userDetails) {
        BadRequest('This Mobile no is already registered');
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

      return 'Otp sent successfully to your Mobile';
    });
  }

  /**
   * verify otp
   * @param model
   */
  async verifyOtp(model: VerifyOtpRequestModel) {
    return this.withRetrySession(async (session: ClientSession) => {
      await this._otpService.verifyOtp(model, session);

      const userDetails = await this.getUserByMobileNo(model.mobileNumber);
      if (!userDetails) {
        BadRequest('User not found');
      }

      // update user and set is active user
      await this._userService.updateById(userDetails.id, {$set: {status: UserStatus.Active}}, session);

      const jwtPayload = {sub: '', id: ''};
      jwtPayload.id = userDetails._id;
      jwtPayload.sub = userDetails.mobileNumber;

      // return jwt token
      return {
        access_token: this.jwtService.sign(jwtPayload)
      };
    });
  }

  /**
   * resend otp
   * @param mobileNumber
   */
  async resendOtp(mobileNumber: string) {
    return this.withRetrySession(async (session: ClientSession) => {
      const userDetails = await this.getUserByMobileNo(mobileNumber);

      if (!userDetails) {
        BadRequest('User not found');
      }

      // create otp and send otp
      await this._otpService.createOtp(mobileNumber, session);
      return 'An otp sent to your mobile';
    });
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

