import {Schema} from 'mongoose';
import {commonSchemaFields, mongooseErrorTransformPluginOptions, schemaOptions} from './base.schema';

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

export const reasonSchema = new Schema({
  name: {type: String, required: [true, 'Reason name is required'], text: true},
  ...commonSchemaFields
}, schemaOptions);

// options
reasonSchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual

// plugins
reasonSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);
