import {Schema} from "mongoose";
import {commonSchemaFields, mongooseErrorTransformPluginOptions} from "./base.schema";
import {DbCollection, PassStatusEnum} from "@covid19-helpline/models";

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
  passStatus: {
    status: {
      type: String,
      enum: Object.values(PassStatusEnum)
    },
    updatedAt: {type: Date},
    updatedById: {type: Schema.Types.ObjectId, ref: DbCollection.users}
  },
  ...commonSchemaFields
});


// options
passSchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual
passSchema
  .virtual('reason', {
    ref: DbCollection.reason,
    localField: 'reasonId',
    foreignField: '_id'
  });

passSchema
  .virtual('createdBy', {
  ref: DbCollection.users,
  localField: 'createdById',
  foreignField: '_id'
});

passSchema
  .virtual('updatedBy', {
  ref: DbCollection.users,
  localField: 'updatedById',
  foreignField: '_id'
});

passSchema
  .virtual('attachmentsDetails', {
  ref: DbCollection.attachments,
  localField: 'attachments',
  foreignField: '_id'
});

passSchema
  .virtual('passStatus.updatedBy', {
    ref: DbCollection.users,
    localField: 'passStatus.passStatus',
    foreignField: '_id',
    justOne: true
  });


// plugins
passSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);
