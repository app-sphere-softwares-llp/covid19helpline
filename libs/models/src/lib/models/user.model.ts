import { MemberTypes } from '../general';
import { UserLoginProviderEnum, UserStatus } from '../enums';
import { StateModel } from './state.model';
import { CityModel } from './city.model';
import { BaseRequestModel } from '../baseRequest.model';

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

export class User {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  status?: UserStatus;
  lastLoginProvider?: UserLoginProviderEnum;
  locale?: string;
  mobileNumber: string;
  memberType?: MemberTypes;
  stateId?: string;
  state?: StateModel;
  cityId?: string;
  city?: CityModel;
  createdById?: string;
  createdBy?: User;
}

export class GetAllAdminUsersRequestModel extends BaseRequestModel {
  constructor() {
    super();
    this.query = '';
  }
}
