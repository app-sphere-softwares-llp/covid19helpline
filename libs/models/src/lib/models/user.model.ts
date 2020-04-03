import {MemberTypes} from '../general';
import {UserLoginProviderEnum, UserStatus} from '../enums';
import {StateModel} from "./state.model";
import {CityModel} from "./city.model";


export class UserLoginWithPasswordRequest {
  emailId?: string;
  mobileNumber?: string;
  password?: string;
}

export class UserLoginSignUpSuccessResponse {
  access_token: string;
  user: User;
}

export class VerifyOtpRequestModel {
  mobileNumber: string;
  code: string;
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
  profilePic?: string;
  status?: UserStatus;
  username?: string;
  lastLoginProvider?: UserLoginProviderEnum;
  locale?: string;
  mobileNumber: string;
  memberType?: MemberTypes;
  stateId?: string;
  state?: StateModel;
  cityId?: string;
  city?: CityModel;
}

