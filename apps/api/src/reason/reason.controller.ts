import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {CityModel, ReasonModel} from "@covid19-helpline/models";
import {ReasonService} from "../shared/services/reason/reason.service";

@Controller('reason')
@UseGuards(AuthGuard('jwt'))
export class ReasonController {
  constructor(private readonly _reasonService: ReasonService) {
  }

  @Post('create')
  async createState(@Body() model: ReasonModel) {
    return await this._reasonService.addUpdate(model);
  }

  @Post('update')
  async updateState(@Body() model: ReasonModel) {
    return await this._reasonService.addUpdate(model);
  }

  @Post('get-all')
  async getAllStates(@Body('term') term: string) {
    return await this._reasonService.getAllReason(term);
  }
}
