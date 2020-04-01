import { createUrl } from '../apiUrls/base.url';

export const PassUrls = {
  get: `${createUrl('pass/get-all')}`, // get use for all and by id both
  create: `${createUrl('pass/create')}`,
  updateStatus: `${createUrl('pass/update-status')}`,
  delete: `${createUrl('pass/delete')}`,
  update: `${createUrl('pass/update')}`,
  attachment: `${createUrl('attachment/profilepic')}`,

};
