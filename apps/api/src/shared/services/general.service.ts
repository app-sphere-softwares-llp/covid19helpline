import {Injectable} from '@nestjs/common';
import {MemberTypes} from "@covid19-helpline/models";

@Injectable()
export class GeneralService {
  get userType(): MemberTypes {
    return this._userType;
  }

  set userType(value: MemberTypes) {
    this._userType = value;
  }

  get locale(): string {
    return this._locale;
  }

  set locale(value: string) {
    this._locale = value;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  private _userId: string;
  private _userType: MemberTypes;
  private _locale: string;
}
