import {User} from "./models";

export interface OneTimeMessagesDismissed {
  showTour: boolean;
}

export enum MemberTypes {
  'alien' = 'alien',
  'normal' = 'normal'
}

export class BaseDbModel {
  _id?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  createdById?: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
}
