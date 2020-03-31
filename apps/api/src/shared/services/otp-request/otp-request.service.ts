import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {
  DbCollection,
  MongooseQueryModel,
  OtpRequestModel,
  SendSmsModel,
  VerifyOtpRequestModel
} from "@covid19-helpline/models";
import {BadRequest, generateRandomCode, generateUtcDate} from "../../helpers/helpers";
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
    await this.expireExistingRequests(mobileNumber, session);
    const otpRequest = new OtpRequestModel();

    otpRequest.mobileNumber = mobileNumber;
    otpRequest.code = generateRandomCode(4);
    otpRequest.createdById = this._generalService.userId;
    otpRequest.isApproved = false;
    otpRequest.isExpired = false;
    otpRequest.codeSentAt = generateUtcDate();

    await this.create([otpRequest], session);

    const smsRequest = new SendSmsModel();
    smsRequest.sender = 'SOCKET';
    smsRequest.route = 4;
    smsRequest.sms = [{
      to: [otpRequest.mobileNumber],
      message: `Here's your otp :-${otpRequest.code}`
    }];

    await this._smsService.sendSms(smsRequest);
    return true;
  }

  async verifyOtp(model: VerifyOtpRequestModel, session: ClientSession) {
    const otpDetails = await this.getDetails(model.mobileNumber, model.code);

    await this.updateById(otpDetails.id, {isApproved: true, isExpired: false}, session);
    await this.expireExistingRequests(model.mobileNumber, session);
    return true;
  }

  async expireExistingRequests(mobileNumber: string, session: ClientSession) {
    return this.update({mobileNumber}, {
      isExpired: true
    }, session);
  }

  async getDetails(mobileNumber: string, code: string) {
    if (!mobileNumber || !code) {
      BadRequest('Invalid otp');
    }

    const query: MongooseQueryModel = new MongooseQueryModel();
    query.filter = {
      mobileNumber, isExpired: false, isApproved: false, code
    };
    query.lean = true;

    const otpDetails = await this.findOne(query);

    if (!otpDetails) {
      BadRequest('Invalid otp');
    }

    otpDetails.id = otpDetails._id;
    return otpDetails;
  }
}
