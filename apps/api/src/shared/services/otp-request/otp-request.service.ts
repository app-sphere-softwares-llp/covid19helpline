import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {DbCollection, MongooseQueryModel, OtpRequestModel, SendSmsModel} from "@covid19-helpline/models";
import {BadRequest, generateRandomCode} from "../../helpers/helpers";
import {SmsService} from "../sms/sms.service";

@Injectable()
export class OtpRequestService extends BaseService<OtpRequestModel & Document> implements OnModuleInit {
  private _smsService: SmsService;

  constructor(
    @InjectModel(DbCollection.otpRequest) private readonly _cityModel: Model<OtpRequestModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService
  ) {
    super(_cityModel);
  }

  onModuleInit(): void {
    this._smsService = this._moduleRef.get('SmsService');
  }

  async createOtp(mobileNumber: string, session: ClientSession) {
    const otpRequest = new OtpRequestModel();

    otpRequest.mobileNumber = mobileNumber;
    otpRequest.code = generateRandomCode(4);
    otpRequest.createdById = this._generalService.userId;
    otpRequest.isApproved = false;
    otpRequest.isExpired = false;

    await this.create([otpRequest], session);

    const smsRequest = new SendSmsModel();
    smsRequest.sender = 'SOCKET';
    smsRequest.route = 4;
    smsRequest.sms = [{
      to: [otpRequest.mobileNumber],
      message: `Here's your otp :-
        ${otpRequest.code}
      `
    }];

    await this._smsService.sendSms(smsRequest);
    return true;
  }

  async verifyOtp(mobileNo: string) {
    const otpDetails = await this.getDetails(mobileNo);
  }

  async expireExistingRequests(mobileNo: string, session: ClientSession) {
    return this.update({mobileNumber: mobileNo}, {
      isExpired: true
    }, session);
  }

  async getDetails(mobileNo: string) {
    if (!mobileNo) {
      BadRequest('Otp expired, Please click resend');
    }

    const query: MongooseQueryModel = new MongooseQueryModel();
    query.filter = {
      mobileNo, isExpired: false, isApproved: false
    };
    query.lean = true;

    const otpDetails = await this.findOne(query);

    if (!otpDetails) {
      BadRequest('Otp expired, Please click resend');
    }

    otpDetails.id = otpDetails._id;
    return otpDetails;
  }
}
