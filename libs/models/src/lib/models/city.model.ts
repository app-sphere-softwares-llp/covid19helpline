import { BaseDbModel } from '../general';
import { StateModel } from './state.model';

export class CityModel extends BaseDbModel {
  name: string;
  stateId: string;
  state?: StateModel;
}
