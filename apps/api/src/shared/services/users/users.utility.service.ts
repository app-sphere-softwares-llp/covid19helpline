import {MemberTypes, User} from "@covid19-helpline/models";
import {BadRequest, isValidMobileNo} from "../../helpers/helpers";
import {BadRequestException} from "@nestjs/common";

export class UsersUtilityService {
  constructor() {
  }

  /**
   * create super admin validations
   * @param user
   * @param userRole
   */
  async createAdminUserValidations(user: User, userRole: MemberTypes) {
    if (userRole !== MemberTypes.superAdmin) {
      BadRequest('Access Denied, Only Super Admin can create an Admin');
    }

    // check first name
    if (!user.mobileNumber) {
      throw new BadRequestException('Mobile Number is mandatory');
    } else {
      if (!isValidMobileNo(user.mobileNumber)) {
        throw new BadRequestException('Invalid mobile no');
      }
    }

    // check first name
    if (!user.firstName) {
      throw new BadRequestException('First Name is mandatory');
    }

    // check last name
    if (!user.lastName) {
      throw new BadRequestException('Last Name is mandatory');
    }

    if (!user.stateId) {
      throw new BadRequestException('State Name is mandatory');
    }

    if (!user.cityId) {
      throw new BadRequestException('City Name is mandatory');
    }
  }


}
