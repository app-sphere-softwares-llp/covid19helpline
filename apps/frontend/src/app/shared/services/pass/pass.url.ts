import { createUrl } from '../apiUrls/base.url';

export const PassUrls = {
  get: `${createUrl('pass/get/:requestId')}`,
  create: `${createUrl('pass/create/:requestId')}`,
  update: `${createUrl('pass/update/:requestId')}`,
  reject: `${createUrl('pass/reject/:requestId')}`,
  approve: `${createUrl('pass/approve/:requestId')}`,
};
