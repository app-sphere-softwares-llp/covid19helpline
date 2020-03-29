import {AttachmentModel, BaseDbModel, CityModel, User} from "@covid19-helpline/models";

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
  passNeededForId: string;
  passNeededFor?: any;
  vehicleNo?: string;
  reasonCodeId: string;
  reasonCodeDetails?: any;
  reasonDetails: string;
  destinationAddress: string;
  attachments: string[];
  attachmentDetails: AttachmentModel[];
  otherPersonDetails: Array<{
    fullName: string;
    aadhaarNo: string;
  }>;
}
