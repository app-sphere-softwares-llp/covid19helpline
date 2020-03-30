import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {StateModel} from "@covid19-helpline/models";
import {StateService} from "../shared/services/state/state.service";

@Controller('state')
@UseGuards(AuthGuard('jwt'))
export class StateController {
  constructor(private readonly _stateService: StateService) {
  }

  @Post('create')
  async createState(@Body() model: StateModel) {
    return await this._stateService.addUpdate(model);
  }

  @Post('update')
  async updateState(@Body() model: StateModel) {
    return await this._stateService.addUpdate(model);
  }

  @Post('get-all')
  async getAllStates(@Body('term') term: string) {
    return await this._stateService.getAllStates(term);
  }
}
