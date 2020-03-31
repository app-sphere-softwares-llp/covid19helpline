import {PassModel, OtherPersonDetails, PassStatusEnum, UpdatePassRequestModel} from "@covid19-helpline/models";
import {aadhaarNoValidator, BadRequest} from "../../helpers/helpers";
import {I18nRequestScopeService} from "nestjs-i18n";

export class PassUtilityService {
  constructor(protected i18n: I18nRequestScopeService) {
  }

  async createPassValidations(model: PassModel) {
    if (!model) {
      BadRequest(await this.i18n.translate('pass.CREATE_VALIDATIONS.NO_MOBILE_NO'));
    }

    if (!model.firstName) {
      BadRequest('First Name is mandatory');
    }

    if (!model.lastName) {
      BadRequest('Last Name is mandatory');
    }

    if (!model.stateId) {
      BadRequest('State Name is mandatory');
    }

    if (!model.cityId) {
      BadRequest('City Name is mandatory');
    }

    if (!aadhaarNoValidator(model.aadhaarNo)) {
      BadRequest('Please enter valid aadhaar no');
    }

    if (!model.mobileNo) {
      BadRequest(await this.i18n.translate('CREATE_VALIDATIONS.NO_MOBILE_NO'));
    }

    if (!model.vehicleNo) {
      BadRequest(await this.i18n.translate('Please enter vehicle no'));
    }

    if (!model.passDate) {
      BadRequest(await this.i18n.translate('Please select pass date'));
    }

    if (!model.address) {
      BadRequest(await this.i18n.translate('Please enter address'));
    }

    if (!model.reasonId) {
      BadRequest(await this.i18n.translate('Please select reason'));
    }

    if (!model.reasonDetails) {
      BadRequest(await this.i18n.translate('Please enter reason details'));
    }

    if (!model.destinationPinCode) {
      BadRequest(await this.i18n.translate('Please enter destination pin code'));
    }

    if (!model.destinationAddress) {
      BadRequest(await this.i18n.translate('Please enter destination address'));
    }

    if (model.otherPersonDetails && model.otherPersonDetails.length) {
      if (!this.checkOtherPersonDetails(model.otherPersonDetails)) {
        BadRequest(await this.i18n.translate('Please check other person\'s details'));
      }
    }
  }

  checkOtherPersonDetails(otherPerson: OtherPersonDetails[]) {
    return otherPerson.every(person => {
      return (!!person.fullName && aadhaarNoValidator(person.aadhaarNo));
    });
  }

  /**
   * update pass status validations
   * @param model
   */
  async updatePassStatusValidations(model: UpdatePassRequestModel) {
    if (!model) {
      BadRequest('Pass not found');
    }

    if (!Object.values(PassStatusEnum).includes(model.status)) {
      BadRequest(await this.i18n.translate('pass.UPDATE_PASS_STATUS_VALIDATIONS.INVALID_STATUS'));
    }
  }
}
