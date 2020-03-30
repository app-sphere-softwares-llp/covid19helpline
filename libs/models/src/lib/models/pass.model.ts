import {BaseDbModel} from '../general';
import {CityModel} from './city.model';
import {AttachmentModel} from './attachment.model';
import {User} from "./user.model";
import {StateModel} from "./state.model";

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
  attachmentDetails: AttachmentModel[];
  otherPersonDetails: OtherPersonDetails[];
  isApproved: boolean;
  approvedAt: Date;
  approvedById: string;
  approvedBy?: User;
}


export class OtherPersonDetails {
  fullName: string;
  aadhaarNo: string;
}
