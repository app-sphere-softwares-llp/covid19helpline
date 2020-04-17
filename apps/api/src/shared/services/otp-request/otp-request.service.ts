import { BaseService } from "../base.service";
import { ClientSession, Document, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ModuleRef } from "@nestjs/core";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { GeneralService } from "../general.service";
import {
  DbCollection,
  MongooseQueryModel,
  OtpRequestModel,
  SendSmsModel,
  VerifyOtpRequestModel
} from "@covid19-helpline/models";
import { BadRequest, generateRandomCode, generateUtcDate, isOTPExpired } from "../../helpers/helpers";
import { SmsService } from "../sms/sms.service";

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
    this._smsService = this._moduleRef.get("SmsService");
  }

  /**
   * create and send otp
   * @param mobileNumber
   * @param session
   */
  async createOtp(mobileNumber: string, session: ClientSession) {
    // expire all existing otp
    await this.expireExistingRequests(mobileNumber, session);

    // otp request model
    const otpRequest = new OtpRequestModel();
    otpRequest.mobileNumber = mobileNumber;
    otpRequest.code = generateRandomCode(4);
    otpRequest.createdById = this._generalService.userId;
    otpRequest.isApproved = false;
    otpRequest.isExpired = false;
    otpRequest.codeSentAt = generateUtcDate();

    // create otp
    await this.create([otpRequest], session);

    // send otp via sms
    const sms = [{
      to: [otpRequest.mobileNumber],
      message: `Here's your otp :-${otpRequest.code}`
    }];

    await this._smsService.buildAndSendSms({ sms });
    return true;
  }

  /**
   * verify otp
   * @param model
   * @param session
   */
  async verifyOtp(model: VerifyOtpRequestModel, session: ClientSession) {
    // get otp details
    const otpDetails = await this.getDetails(model.mobileNumber, model.code);

    // approve otp
    await this.updateById(otpDetails.id, { isApproved: true, isExpired: false }, session);
    // expire all existing otp
    await this.expireExistingRequests(model.mobileNumber, session);
    return true;
  }

  /**
   * expire existing otp
   * @param mobileNumber
   * @param session
   */
  async expireExistingRequests(mobileNumber: string, session: ClientSession) {
    return this.update({ mobileNumber }, {
      isExpired: true
    }, session);
  }

  /**
   * get otp details
   * check if otp is valid and not expired
   * @param mobileNumber
   * @param code
   */
  async getDetails(mobileNumber: string, code: string) {
    if (!mobileNumber || !code) {
      BadRequest("Invalid otp");
    }

    // otp details query
    const query: MongooseQueryModel = new MongooseQueryModel();
    query.filter = {
      mobileNumber, isExpired: false, isApproved: false, code
    };
    query.lean = true;

    // get otp details
    const otpDetails = await this.findOne(query);

    // if no otp found throw error
    if (!otpDetails) {
      BadRequest("Invalid otp");
    } else {
      // check if otp is expired or not
      if (isOTPExpired(otpDetails.createdAt)) {
        BadRequest("This otp is expired please ask for new one");
      }
    }

    otpDetails.id = otpDetails._id;
    return otpDetails;
  }
}
