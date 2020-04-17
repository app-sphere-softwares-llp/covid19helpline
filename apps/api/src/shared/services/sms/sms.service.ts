import { SendSmsModel } from "@covid19-helpline/models";
import { post, Response } from "request";
import { Injectable } from "@nestjs/common";
import { DEFAULT_SMS_SENDING_OPTIONS } from "../../helpers/defaultValueConstant";

const urls = {
  sendSms: "https://api.msg91.com/api/v2/sendsms"
};

@Injectable()
export class SmsService {
  constructor() {
  }

  /**
   * send sms to a mobile no
   * @param model
   */
  sendSms(model: SendSmsModel) {
    return new Promise((resolve, reject) => {
      post(urls.sendSms, {
        json: true,
        body: model,
        headers: {
          authkey: process.env.SMS_AUTH_KEY,
          "Content-Type": "application/json"
        }
      }, (err: Error, res: Response, body: any) => {
        if (err) {
          reject(err);
        }

        if (!body || body.type === "error") {
          reject(new Error(body ? body.message : "Something Went Wrong! Sms not sent"));
        }

        resolve(body);
      });
    });
  }

  /**
   * build and send sms
   * builds a sms model and send's sms
   * @param config
   */
  async buildAndSendSms(config: Partial<SendSmsModel>) {
    const smsModel = new SendSmsModel();
    smsModel.route = config.route || DEFAULT_SMS_SENDING_OPTIONS.route;
    smsModel.sender = config.sender || DEFAULT_SMS_SENDING_OPTIONS.sender;
    smsModel.sms = config.sms;

    this.sendSms(smsModel);
  }
}
