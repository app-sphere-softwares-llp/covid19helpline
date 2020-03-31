import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {PassModel, UpdatePassStatusRequestModel} from "@covid19-helpline/models";
import {PassService} from "../shared/services/pass/pass.service";

@Controller('pass')
@UseGuards(AuthGuard('jwt'))
export class PassController {
  constructor(private readonly _passService: PassService) {
  }

  @Post('create')
  async createPass(@Body() model: PassModel) {
    return await this._passService.addUpdate(model);
  }

  @Post('update')
  async updatePass(@Body() model: PassModel) {
    return await this._passService.addUpdate(model);
  }

  @Post('update-status')
  async updatePassStatus(@Body() model: UpdatePassStatusRequestModel) {
    return await this._passService.updatePassStatus(model);
  }

  @Post('pass-details')
  async getPassDetails(@Body('id') id: string) {
    return await this._passService.getPassById(id);
  }

  @Post('delete')
  async deletePass(@Body('id') id: string) {
    return await this._passService.deletePass(id);
  }

  @Post('get-all')
  async getAllPasses(@Body('term') term: string) {
    return await this._passService.getAllPasses(term);
  }
}
