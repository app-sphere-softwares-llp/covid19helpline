import { User } from '@covid19-helpline/models';

export class AttachmentModel {
  id?: string;
  name: string;
  mimeType?: string;
  url: string;
  createdById: string;
  createdBy?: User;
}
