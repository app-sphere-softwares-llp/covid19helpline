import { Schema } from 'mongoose';
import { MemberTypes, UserLoginProviderEnum, UserStatus } from '@covid19-helpline/models';
import { mongooseErrorTransformPluginOptions, schemaOptions } from './base.schema';

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');
const uniqueValidator = require('mongoose-unique-validator');

export const userSchema = new Schema(
  {
    emailId: {
      type: String, required: true, index: { unique: true, partialFilterExpression: { isDeleted: false } },
      uniqueCaseInsensitive: true
    },
    userName: { type: String },
    password: { type: String },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    profilePic: { type: String },
    confirmed: { type: Boolean, default: false },
    locale: { type: String },
    mobileNumber: { type: String },
    status: { type: String, enum: Object.values(UserStatus) },
    lastLoginProvider: { type: String, enum: Object.values(UserLoginProviderEnum) },
    memberType: { type: String, enum: Object.values(MemberTypes) },
    oneTimeMessagesDismissed: { type: Array },
    timezoneInfo: {
      type: Schema.Types.Mixed
    },
    recentLoginInfo: {
      type: Schema.Types.Mixed
    },
    isDeleted: { type: Boolean, default: false }
  }, schemaOptions
);

// options
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
  virtuals: true
});
userSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
  virtuals: true
});


// plugins
userSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions)
  .plugin(uniqueValidator, { message: '{PATH} already exists :- {VALUE}' });

