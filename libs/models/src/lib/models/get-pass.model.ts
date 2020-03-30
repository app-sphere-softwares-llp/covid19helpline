import {BaseDbModel} from '../general';
import {CityModel} from './city.model';
import {AttachmentModel} from './attachment.model';
import {User} from "./user.model";

export class GetPassModel extends BaseDbModel {
  picUrl: string;
  firstName: string;
  lastName: string;
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
  destinationAddress: string;
  attachments: string[];
  attachmentDetails: AttachmentModel[];
  otherPersonDetails: Array<{
    fullName: string;
    aadhaarNo: string;
  }>;
  isApproved: boolean;
  approvedAt: Date;
  approvedById: string;
  approvedBy?: User;
}
