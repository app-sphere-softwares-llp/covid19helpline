import {MemberTypes, OneTimeMessagesDismissed} from '../general';
import {UserLoginProviderEnum, UserStatus} from '../enums';


export class UserLoginWithPasswordRequest {
  emailId?: string;
  mobileNumber?: string;
  password: string;
}

export class UserLoginSignUpSuccessResponse {
  access_token: string;
  user: User;
}

export interface UserRecentLoginInfo {
  lastLoggedInTime: string;
}

export class UserTimeZoneInfo {
  timezoneNext: string;
  dateNext: Date;
  offsetNext: number;
  timezoneCurrent: string;
  offsetCurrent: number;
}

export class User {
  id?: string;
  _id?: string;
  emailId?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  otp?: string;
  otpSentAt?: Date;
  isOtpExpired?: boolean;
  confirmed?: boolean;
  profilePic?: string;
  status?: UserStatus;
  username?: string;
  lastLoginProvider?: UserLoginProviderEnum;
  locale?: string;
  mobileNumber: string;
  aadhaarNo: string;
  memberType?: MemberTypes;
}

