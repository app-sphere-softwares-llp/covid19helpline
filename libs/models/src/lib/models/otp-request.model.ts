import { BaseDbModel } from '../general';

export class OtpRequestModel extends BaseDbModel {
  mobileNumber: string;
  code: string;
  codeSentAt: Date;
  isExpired: boolean;
  isApproved: boolean;
}
