import { createUrl } from '../apiUrls/base.url';

export const StateCityUrls = {
  getAllStates: `${createUrl('state/get-all')}`,
  getCities: `${createUrl('city/get-all')}`,
};
