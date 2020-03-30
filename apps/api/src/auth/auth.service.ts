import {BadRequestException, Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {InjectModel} from '@nestjs/mongoose';
import {Document, Model} from 'mongoose';
import {get, Response} from 'request';
import {ModuleRef} from '@nestjs/core';
import {
  BadRequest,
  emailAddressValidator,
  generateRandomCode,
  generateUtcDate,
  isResetPasswordCodeExpired
} from '../shared/helpers/helpers';
import * as bcrypt from 'bcrypt';
import {EmailService} from '../shared/services/email/email.service';
import {ResetPasswordService} from '../shared/services/reset-password/reset-password.service';
import {
  DbCollection,
  EmailTemplatePathEnum,
  MongooseQueryModel,
  ResetPasswordVerifyModel,
  User,
  UserLoginProviderEnum,
  UserLoginWithPasswordRequest,
  UserStatus
} from '@covid19-helpline/models';
import {UsersService} from '../shared/services/users/users.service';
import {OtpRequestService} from "../shared/services/otp-request/otp-request.service";

const saltRounds = 10;

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

        return 'And otp sent to your mobile';
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
   * forgot password
   * get email id and check if user exists or not
   * if yes return unique code
   * @param emailId
   */
  async forgotPassword(emailId: string) {
    const userDetails = await this._userService.findOne({filter: {emailId: emailId}});

    if (!userDetails) {
      throw new BadRequestException('User not found');
    } else {
      // check if user is registered with google then throw error
      if (!userDetails.password || userDetails.lastLoginProvider === UserLoginProviderEnum.google) {
        throw new BadRequestException('Ohh! We found that you used your Google Account to sign in into Assign Work. Use Google Sign In Instead.');
      }

      const session = await this._userModel.db.startSession();
      session.startTransaction();

      try {
        // generate random code
        const code = generateRandomCode(6);
        const templateData = {user: {firstName: userDetails.firstName, lastName: userDetails.lastName}, code};

        // send email
        const messageTemplate = await this._emailService.getTemplate(EmailTemplatePathEnum.resetPassword, templateData);
        const invitationEmail = {
          to: [emailId], subject: 'Reset password',
          message: messageTemplate
        };
        this._emailService.sendMail(invitationEmail.to, invitationEmail.subject, invitationEmail.message);

        // create reset password doc
        const resetPasswordDoc = new this._resetPasswordService.dbModel();
        resetPasswordDoc.emailId = emailId;
        resetPasswordDoc.code = code;
        resetPasswordDoc.resetPasswordAt = generateUtcDate();
        resetPasswordDoc.isExpired = false;

        // create entry in reset password collection
        await this._resetPasswordService.create([resetPasswordDoc], session);

        await session.commitTransaction();
        session.endSession();

        return 'Reset password code sent to your email address successfully';
      } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
      }
    }
  }

  /**
   * reset password
   * check if all details are available or not
   * check code expiry
   * update user password with new one
   * expire given code and return success message
   * @param model
   */
  async resetPassword(model: ResetPasswordVerifyModel) {
    // validations

    if (!model.code) {
      throw new BadRequestException('invalid request, please add verification code');
    }

    if (!model.emailId) {
      throw new BadRequestException('invalid request, please add user email id');
    }

    if (!model.password) {
      throw new BadRequestException('invalid request, please add password');
    }

    // start session
    const session = await this._userModel.db.startSession();
    session.startTransaction();

    try {
      const codeDetailsFilter = {
        emailId: model.emailId,
        code: model.code,
        isExpired: false
      };
      const codeDetails = await this._resetPasswordService.findOne({
        filter: codeDetailsFilter
      });

      if (codeDetails) {
        // check reset password code expired
        if (isResetPasswordCodeExpired(codeDetails.resetPasswordAt)) {
          BadRequest('code is expired, please click resend button');
        }

        // update user password
        const hashedPassword = await bcrypt.hash(model.password, saltRounds);
        await this._userService.update({emailId: model.emailId}, {password: hashedPassword}, session);

        // expire all this verification code
        await this._resetPasswordService.bulkUpdate(codeDetailsFilter, {isExpired: true}, session);

        await session.commitTransaction();
        session.endSession();
        return 'Password reset success';

      } else {
        // no details found throw error
        BadRequest('invalid verification code');
      }
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  /**
   * sign up with password
   * check basic validations
   * create jwt token and return it
   * @param user
   */
  async signUpWithPassword(user: User) {
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
        BadRequest('Mobile no already in use');
      }

      // create new user and assign jwt token
      const model = new User();
      model.mobileNumber = user.mobileNumber;
      model.username = model.mobileNumber;
      model.firstName = user.firstName;
      model.lastName = user.lastName;
      model.status = UserStatus.Active;
      model.lastLoginProvider = UserLoginProviderEnum.normal;

      // create new user
      await this._userService.create([model], session);

      // create otp and send otp
      await this._otpService.createOtp(model.mobileNumber, session);

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
   * verify given auth token with google
   * check if given token is valid
   * if valid then check if one is existing user or not of our app
   * if existing user update it's last login type and return jwt token
   * if new user create new user and return jwt token
   * @param token
   */
  async verifyGoogleAuthToken(token: string) {
    if (!token) {
      BadRequest('token not found');
    }

    const session = await this._userModel.db.startSession();
    session.startTransaction();

    try {
      const authTokenResult = await this.googleAuthTokenChecker(token);

      /*
        as per google if we receive token is valid
        we still need to check if token aud property contains our app client id
       */
      if (authTokenResult) {

        const userNameFromGoogle = authTokenResult.name.split(' ');

        if (authTokenResult.aud === process.env.GOOGLE_CLIENT_ID) {

          const jwtPayload = {sub: '', id: ''};

          // get user details by email id from db
          const userDetails = await this.getUserByMobileNo(authTokenResult.email);

          // check user exist
          if (userDetails) {
            // normal sign in
            await this._userService.updateById(userDetails._id.toString(), {
              $set: {
                firstName: userNameFromGoogle[0] || '',
                lastName: userNameFromGoogle[1] || '',
                lastLoginProvider: UserLoginProviderEnum.google,
                profilePic: authTokenResult.picture,
                status: UserStatus.Active
              }
            }, session);

            // assign jwt payload
            jwtPayload.id = userDetails._id;
            jwtPayload.sub = userDetails.emailId;
          } else {

            // new user
            // create new user model
            const user = new User();
            user.emailId = authTokenResult.email;
            user.username = user.emailId;
            user.firstName = userNameFromGoogle[0] || '';
            user.lastName = userNameFromGoogle[1] || '';
            user.lastLoginProvider = UserLoginProviderEnum.google;
            user.profilePic = authTokenResult.picture;
            user.status = UserStatus.Active;

            // save it to db
            const newUser = await this._userModel.create([user], session);
            jwtPayload.sub = newUser[0].emailId;
            jwtPayload.id = newUser[0].id;
          }

          await session.commitTransaction();
          session.endSession();

          // return jwt token
          return {
            access_token: this.jwtService.sign(jwtPayload)
          };
        } else {
          throw new UnauthorizedException('Invalid user login');
        }
      } else {
        throw new UnauthorizedException('Invalid user login');
      }
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  /**
   * google token checker
   * @param token
   */
  private async googleAuthTokenChecker(token: string) {
    return new Promise<any>((resolve: Function, reject: Function) => {
      get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`, async (err: Error, res: Response, body: any) => {
        if (err) {
          reject(err);
        }

        body = JSON.parse(body);

        if (body.error) {
          reject(body.error);
        }

        resolve(body);
      });
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
    return this._userService.findOne(userQuery);
  }
}

