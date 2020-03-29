import {Schema} from "mongoose";
import {commonSchemaFields} from "./base.schema";
import {DbCollection} from "@covid19-helpline/models";

export const getPassSchema = new Schema({
  picUrl: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  cityId: {type: Schema.Types.ObjectId, ref: DbCollection.city},
  aadhaarNo: {type: String},
  aadharPicUrl: {type: String},
  address: {type: String},
  mobileNo: {type: String},
  passDate: {type: Date},
  passNeededForId: {type: String},
  vehicleNo: {type: String},
  reasonCodeId: {type: String},
  reasonDetails: {type: String},
  destinationAddress: {type: String},
  attachments: [{type: Schema.Types.ObjectId, ref: DbCollection.attachments}],
  otherPersonDetails: {
    type: Array,
    fullName: {type: String},
    aadhaarNo: {type: String}
  },
  ...commonSchemaFields
});
