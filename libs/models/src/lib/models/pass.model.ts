import {BaseDbModel} from '../general';
import {CityModel} from './city.model';
import {AttachmentModel} from './attachment.model';
import {StateModel} from "./state.model";
import {PassStatusEnum} from "../enums";
import {User} from "./user.model";
import {BaseRequestModel} from "../baseRequest.model";

export class PassModel extends BaseDbModel {
  picUrl: string;
  firstName: string;
  lastName: string;
  stateId: string;
  state?: StateModel;
  cityId: string;
  city?: CityModel;
  aadhaarNo: string;
  aadharPicUrl: string;
  address: string;
  mobileNo: string;
  passDate: string;
  passValidity: number;
  vehicleNo?: string;
  reasonId: string;
  reason?: any;
  reasonDetails: string;
  destinationPinCode: string;
  destinationAddress: string;
  attachments: string[];
  attachmentsDetails?: AttachmentModel[];
  otherPersonDetails: OtherPersonDetails[];
  passStatus: {
    status: PassStatusEnum;
    updatedAt?: Date;
    updatedById?: string;
    updateBy?: User;
  };
  qrCode?: string;
}

export class OtherPersonDetails {
  fullName: string;
  aadhaarNo: string;
}

export class UpdatePassStatusRequestModel {
  id: string;
  status: PassStatusEnum;
  passValidity: number;
}

export class GetAllPassesRequestModel extends BaseRequestModel {
  stateId?: string;
  cityId?: string;
  status: PassStatusEnum;
  reasonId?: any[];
  query?: string;

  constructor() {
    super();
    this.query = '';
    this.count = 10;
  }
}
