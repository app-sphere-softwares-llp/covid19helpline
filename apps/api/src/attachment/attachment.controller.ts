import {Controller, Delete, Param, Post, UploadedFiles, UseGuards, UseInterceptors} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {AnyFilesInterceptor} from '@nestjs/platform-express';
import {AttachmentService} from "../shared/services/attachment/attachment.service";

@Controller('attachment')
@UseGuards(AuthGuard('jwt'))
export class AttachmentController {
  constructor(private readonly _attachmentService: AttachmentService) {

  }

  @Post('add')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadAttachment(@UploadedFiles() files) {
    return await this._attachmentService.addAttachment(files);
  }

  @Post('profilepic')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadProfilePic(@UploadedFiles() files) {
    return await this._attachmentService.uploadProfilePic(files);
  }

  @Delete(':id')
  async deleteAttachment(@Param() id: string) {
    return await this._attachmentService.deleteAttachment(id);
  }

}
