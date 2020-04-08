import { createUrl } from '../apiUrls/base.url';

export const UserUrls = {
  profile: `${createUrl('user/profile')}`,
  deleteAdmin: `${createUrl('user/delete-admin-user')}`,
  getAllAdmin: `${createUrl('user/get-admin-users')}`,
  createAdmin: `${createUrl('user/create-admin-user')}`,
  updateAdmin: `${createUrl('user/update-admin-user')}`,
};
