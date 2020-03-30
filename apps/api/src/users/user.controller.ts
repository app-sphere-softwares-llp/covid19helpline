import {Body, Controller, Get, Post, Put, Request, UseGuards} from '@nestjs/common';
import {UsersService} from '../shared/services/users/users.service';
import {AuthGuard} from '@nestjs/passport';
import {SendSmsModel, User} from '@covid19-helpline/models';
import {SmsService} from '../shared/services/sms/sms.service';
import {generateRandomCode} from "../shared/helpers/helpers";

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly _userService: UsersService, private _smsService: SmsService) {
  }

  @Get('profile')
  async getUser(@Request() req) {
    return await this._userService.getUserProfile(req.user.id);
  }

  @Put('profile')
  async updateUserProfile(@Body() id: string, @Body() user: Partial<User>) {
    return await this._userService.updateUser(id, user, null);
  }

  @Post('send-otp')
  async sendOtp(@Body() mobileNo: number) {
    const sendSms = new SendSmsModel();
    sendSms.sender = 'SOCKET';
    sendSms.route = 4;
    sendSms.sms = [{
      to: [mobileNo],
      message: `Here's your otp :-
        ${generateRandomCode(4)}
      `
    }];

    return await this._smsService.sendSms(sendSms);
  }
}
