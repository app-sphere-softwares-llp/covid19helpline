import {Schema} from "mongoose";
import {mongooseErrorTransformPluginOptions, schemaOptions} from "./base.schema";

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

export const otpRequestSchema = new Schema({
  mobileNumber: {type: String, required: true},
  code: {type: String, required: true},
  codeSentAt: {type: Date},
  isApproved: {type: Boolean, default: false},
  isExpired: {type: Boolean, default: false},
  isDeleted: {type: Boolean, default: false},
}, schemaOptions);

// options
otpRequestSchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual

// plugins
otpRequestSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);