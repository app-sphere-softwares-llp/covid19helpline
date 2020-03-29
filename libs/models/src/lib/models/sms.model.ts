export class SendSmsModel {
  sender: string;
  route?: number;
  country?: number;
  sms: SmsMessageModel[]
}

export class SmsMessageModel {
  message: string;
  to: number[];
}
