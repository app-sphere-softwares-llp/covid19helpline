import { SendSmsModel } from '@covid19-helpline/models';
import { post, Response } from 'request';
import { SEND_SMS_URL } from '../../helpers/defaultValueConstant';

export class SmsService {
  constructor() {
  }

  sendSms(config: SendSmsModel) {
    return new Promise((resolve, reject) => {
      post(SEND_SMS_URL, {
        json: true,
        body: config,
        headers: {
          authkey: process.env.SMS_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }, (err: Error, res: Response, body: any) => {
        if (err) {
          reject(err);
        }

        if (!body || body.type === 'error') {
          reject(new Error(body ? body.message : 'Something Went Wrong! Sms not sent'));
        }

        resolve(body);
      });
    });
  }
}
