import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {CityService} from "../shared/services/city/city.service";
import {CityModel, StateModel} from "@covid19-helpline/models";

@Controller('city')
@UseGuards(AuthGuard('jwt'))
export class CityController {
  constructor(private readonly _cityService: CityService) {
  }

  @Post('create')
  async createCity(@Body() model: CityModel) {
    return await this._cityService.addUpdate(model);
  }

  @Post('update')
  async updateCity(@Body() model: CityModel) {
    return await this._cityService.addUpdate(model);
  }

  @Post('delete')
  async deleteCity(@Body('id') id: string) {
    return await this._cityService.deleteCity(id);
  }

  @Post('get-all')
  async getAllCities(@Body('stateId') stateId: string, @Body('term') term: string) {
    return await this._cityService.getAllCities(stateId, term);
  }

  @Post('bulk-insert')
  async bulkInsert(@Body() model: CityModel[]) {
    return await this._cityService.bulkInsert(model);
  }
}
