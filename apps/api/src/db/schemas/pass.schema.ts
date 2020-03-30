import {Schema} from "mongoose";
import {commonSchemaFields, mongooseErrorTransformPluginOptions} from "./base.schema";
import {DbCollection} from "@covid19-helpline/models";

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

export const passSchema = new Schema({
  picUrl: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  stateId: {type: Schema.Types.ObjectId, ref: DbCollection.state},
  cityId: {type: Schema.Types.ObjectId, ref: DbCollection.city},
  aadhaarNo: {type: String},
  aadharPicUrl: {type: String},
  mobileNo: {type: String},
  vehicleNo: {type: String},
  passDate: {type: Date},
  address: {type: String},
  otherPersonDetails: {
    type: Array,
    fullName: {type: String},
    aadhaarNo: {type: String}
  },
  reasonId: {type: Schema.Types.ObjectId, ref: DbCollection.reason},
  reasonDetails: {type: String},
  destinationPinCode: {type: String},
  destinationAddress: {type: String},
  attachments: [{type: Schema.Types.ObjectId, ref: DbCollection.attachments}],
  isApproved: {type: Boolean, default: false},
  approvedAt: {type: Date},
  approvedById: {type: Schema.Types.ObjectId, ref: DbCollection.users, required: [true, 'Created by is required']},
  ...commonSchemaFields
});


// options
passSchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual

// plugins
passSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);
