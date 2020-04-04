import { createUrl } from '../apiUrls/base.url';

export const UserUrls = {
  profile: `${createUrl('user/profile')}`,
  getAllAdmin: `${createUrl('user/get-all-admin')}`,
};
