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
  async createReason(@Body() model: ReasonModel) {
    return await this._reasonService.addUpdate(model);
  }

  @Post('update')
  async updateReason(@Body() model: ReasonModel) {
    return await this._reasonService.addUpdate(model);
  }

  @Post('delete')
  async deleteReason(@Body('id') id: string) {
    return await this._reasonService.deleteReason(id);
  }

  @Post('get-all')
  async getAllStates(@Body('term') term: string) {
    return await this._reasonService.getAllReason(term);
  }

  @Post('bulk-insert')
  async bulkInsert(@Body() model: ReasonModel[]) {
    return await this._reasonService.bulkInsert(model);
  }
}
