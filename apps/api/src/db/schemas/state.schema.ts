import {Schema} from 'mongoose';
import {commonSchemaFields, mongooseErrorTransformPluginOptions, schemaOptions} from './base.schema';

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

export const stateSchema = new Schema({
  name: {type: String, required: [true, 'State name is required'], text: true},
  ...commonSchemaFields
}, schemaOptions);

// options
stateSchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual

// plugins
stateSchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);
