import {Schema} from 'mongoose';
import {DbCollection, MemberTypes, UserLoginProviderEnum, UserStatus} from '@covid19-helpline/models';
import {mongooseErrorTransformPluginOptions, schemaOptions} from './base.schema';

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');
const uniqueValidator = require('mongoose-unique-validator');

export const userSchema = new Schema(
  {
    emailId: {type: String, required: false},
    userName: {type: String},
    password: {type: String},
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    profilePic: {type: String},
    locale: {type: String},
    mobileNumber: {type: String, required: true},
    status: {type: String, enum: Object.values(UserStatus)},
    lastLoginProvider: {type: String, enum: Object.values(UserLoginProviderEnum)},
    memberType: {type: String, enum: Object.values(MemberTypes)},
    stateId: {type: Schema.Types.ObjectId, ref: DbCollection.state},
    cityId: {type: Schema.Types.ObjectId, ref: DbCollection.city},
    isDeleted: {type: Boolean, default: false}
  }, schemaOptions
);

// options
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
  virtuals: true
});
userSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
  virtuals: true
});

// virtual
userSchema
  .virtual('state', {
    ref: DbCollection.state,
    localField: 'stateId',
    foreignField: '_id'
  });

userSchema
  .virtual('city', {
    ref: DbCollection.city,
    localField: 'cityId',
    foreignField: '_id'
  });


// plugins
userSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions)
  .plugin(uniqueValidator, {message: '{PATH} already exists :- {VALUE}'});

