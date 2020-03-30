import {SendSmsModel} from '@covid19-helpline/models';
import {post, Response,} from 'request';

const urls = {
  sendSms: 'https://api.msg91.com/api/v2/sendsms',
};

export class SmsService {
  constructor() {
  }

  sendSms(model: SendSmsModel) {
    return new Promise((resolve, reject) => {
      post(urls.sendSms, {
        json: true,
        body: model,
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
