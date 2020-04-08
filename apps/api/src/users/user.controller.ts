import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards
} from '@nestjs/common';
import { UsersService } from '../shared/services/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import {GetAllAdminUsersRequestModel, MemberTypes, User} from '@covid19-helpline/models';
import { SmsService } from '../shared/services/sms/sms.service';
import { Roles } from '../shared/guards/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly _userService: UsersService,
    private _smsService: SmsService
  ) {}

  @Get('profile')
  async getUser(@Request() req) {
    return await this._userService.getUserProfile(req.user.id);
  }

  @Post('get-admin-users')
  @Roles(MemberTypes.superAdmin)
  @UseGuards(RolesGuard)
  async getAllAdminUsers(@Body() model: GetAllAdminUsersRequestModel) {
    return await this._userService.getAllAdminUsers(model);
  }

  @Post('create-admin-user')
  @Roles(MemberTypes.superAdmin)
  @UseGuards(RolesGuard)
  async createAdminUser(@Body() model: User) {
    return await this._userService.createAdminUser(model);
  }

  @Post('update-admin-user')
  @Roles(MemberTypes.superAdmin)
  @UseGuards(RolesGuard)
  async updateAdminUser(@Body() model: User) {
    return await this._userService.updateAdminUser(model);
  }

  @Post('delete-admin-user')
  @Roles(MemberTypes.superAdmin)
  @UseGuards(RolesGuard)
  async deleteAdminUser(@Body('id') id: string) {
    return await this._userService.deleteAdminUser(id);
  }

  @Put('profile')
  async updateUserProfile(@Body() id: string, @Body() user: Partial<User>) {
    return await this._userService.updateUser(id, user, null);
  }
}
