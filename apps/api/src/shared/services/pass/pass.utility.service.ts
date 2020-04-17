import {OtherPersonDetails, PassModel, PassStatusEnum, UpdatePassStatusRequestModel} from "@covid19-helpline/models";
import {aadhaarNoValidator, BadRequest, isValidMobileNo} from "../../helpers/helpers";
import {I18nRequestScopeService} from "nestjs-i18n";
import * as moment from 'moment';
import { DEFAULT_DATE_FORMAT } from "../../helpers/defaultValueConstant";

export class PassUtilityService {
  constructor(protected i18n: I18nRequestScopeService) {
  }

  /**
   * create pass validations
   * @param model
   */
  async createPassValidations(model: PassModel) {
    if (!model) {
      BadRequest(await this.i18n.translate('pass.CREATE_VALIDATIONS.NO_MOBILE_NO'));
    }

    // first name
    if (!model.firstName) {
      BadRequest('First Name is mandatory');
    }

    // last name
    if (!model.lastName) {
      BadRequest('Last Name is mandatory');
    }

    // state id
    if (!model.stateId) {
      BadRequest('State Name is mandatory');
    }

    // city id
    if (!model.cityId) {
      BadRequest('City Name is mandatory');
    }

    // aadhaar no
    if (!aadhaarNoValidator(model.aadhaarNo)) {
      BadRequest('Please enter valid aadhaar no');
    }

    // mobile no
    if (!model.mobileNo) {
      BadRequest(await this.i18n.translate('pass.CREATE_VALIDATIONS.NO_MOBILE_NO'));
    } else {
      if (!isValidMobileNo(model.mobileNo)) {
        BadRequest(await this.i18n.translate('pass.GENERAL.INVALID_MOBILE_NO'));
      }
    }

    // vehicle no
    if (!model.vehicleNo) {
      BadRequest(await this.i18n.translate('Please enter vehicle no'));
    }

    // pass date
    if (!model.passDate) {
      BadRequest(await this.i18n.translate('Please select pass date'));
    } else if (moment(model.passDate).isBefore(moment(), 'day')) {
      BadRequest(await this.i18n.translate('Pass can not be created for past date'));
    }

    // address
    if (!model.address) {
      BadRequest(await this.i18n.translate('Please enter address'));
    }

    // reason id
    if (!model.reasonId) {
      BadRequest(await this.i18n.translate('Please select reason'));
    }

    // reason details
    if (!model.reasonDetails) {
      BadRequest(await this.i18n.translate('Please enter reason details'));
    }

    // destination pin code
    if (!model.destinationPinCode) {
      BadRequest(await this.i18n.translate('Please enter destination pin code'));
    }

    // destination address
    if (!model.destinationAddress) {
      BadRequest(await this.i18n.translate('Please enter destination address'));
    }

    // other person details
    if (model.otherPersonDetails && model.otherPersonDetails.length) {
      if (!this.checkOtherPersonDetails(model.otherPersonDetails)) {
        BadRequest(await this.i18n.translate('Please check other person\'s details'));
      }
    }

    // pass validity
    if (!model.passValidity) {
      BadRequest('Please select pass validity');
    } else {
      // minimum and maximum pass validity
      if (model.passValidity < 2 || model.passValidity > 12) {
        BadRequest('Invalid pass validity, Pass should be valid for Minimum 2 hours and Maximum 12 hours');
      }
    }
  }

  /**
   * check other person details
   * @param otherPerson
   */
  checkOtherPersonDetails(otherPerson: OtherPersonDetails[]) {
    return otherPerson.every(person => {
      return (!!person.fullName && aadhaarNoValidator(person.aadhaarNo));
    });
  }

  /**
   * update pass status validations
   * @param model
   */
  async updatePassStatusValidations(model: UpdatePassStatusRequestModel) {
    if (!model) {
      BadRequest('Pass not found');
    }

    if (!Object.values(PassStatusEnum).includes(model.status) || model.status === PassStatusEnum.pending) {
      BadRequest(await this.i18n.translate('pass.UPDATE_PASS_STATUS_VALIDATIONS.INVALID_STATUS'));
    }
  }
}
