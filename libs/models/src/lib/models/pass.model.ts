import {BaseDbModel} from '../general';
import {CityModel} from './city.model';
import {AttachmentModel} from './attachment.model';
import {StateModel} from "./state.model";
import {PassStatusEnum} from "../enums";
import {User} from "./user.model";
import {MongoosePaginateQuery} from "../queryOptions";
import {Schema} from 'mongoose';

export class PassModel extends BaseDbModel {
  picUrl: string;
  firstName: string;
  lastName: string;
  stateId: string;
  state?: StateModel;
  cityId: string;
  city?: CityModel[];
  aadhaarNo: string;
  aadharPicUrl: string;
  address: string;
  mobileNo: string;
  passDate: string;
  vehicleNo?: string;
  reasonId: string;
  reason?: any;
  reasonDetails: string;
  destinationPinCode: string;
  destinationAddress: string;
  attachments: string[];
  attachmentDetails?: AttachmentModel[];
  otherPersonDetails: OtherPersonDetails[];
  passStatus: {
    status: PassStatusEnum;
    updatedAt?: Date;
    updatedById?: string;
    updateBy?: User;
  }
}

export class OtherPersonDetails {
  fullName: string;
  aadhaarNo: string;
}

export class UpdatePassStatusRequestModel {
  id: string;
  status: PassStatusEnum;
}

export class GetAllPassesRequestModel extends MongoosePaginateQuery {
  stateId?: any[];
  cityId?: any[];
  status: PassStatusEnum;
  reasonId?: any[];
  query?: string;

  constructor() {
    super();
    this.query = '';
  }
}
