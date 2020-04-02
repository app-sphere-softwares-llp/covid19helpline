import {User} from "./models";

export enum MemberTypes {
  normal = 'normal',
  admin = 'admin',
  superAdmin = 'super-admin'
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
