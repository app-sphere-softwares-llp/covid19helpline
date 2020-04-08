import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { GeneralService } from '../../shared/services/general.service';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { DbCollection, User } from '@covid19-helpline/models';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private _generalService: GeneralService,
    @InjectModel(DbCollection.users)
    protected readonly _userModel: Model<User & Document>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: any) {
    const userDetails = await this._userModel
      .findById(payload.id)
      .select('_id memberType');
    if (!userDetails) {
      this._generalService.userId = null;
      this._generalService.userType = null;
      throw new UnauthorizedException();
    }
    this._generalService.userId = payload.id;
    this._generalService.userType = userDetails.memberType;
    return {
      mobileNumber: payload.sub,
      id: payload.id,
      memberType: userDetails.memberType
    };
  }
}
