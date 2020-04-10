import {Body, Controller, Get, Header, Param, Post, Query, Res} from '@nestjs/common';
import {resolvePathHelper} from '../shared/helpers/helpers';
import {PassService} from "../shared/services/pass/pass.service";

@Controller('public')
export class PublicController {
  constructor(private readonly _passService: PassService) {
  }

  @Get('error-log')
  @Header('Content-Type', 'application/octet-stream')
  getErrorLog(@Res() res) {
    res.sendFile(resolvePathHelper('error.log'));
  }

  @Get('generate-pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=pass.pdf')
  async createPdf(@Query('id') id: string, @Res() res) {
    const path = await this._passService.generatePdf(id);
    res.sendFile(path);
  }


  @Get('check-pass')
  async checkPass(@Query('id') id: string) {
    return await this._passService.checkPass(id);
  }
}
