import {Schema, Types} from 'mongoose';
import {commonSchemaFields, mongooseErrorTransformPluginOptions, schemaOptions} from './base.schema';
import {DbCollection} from "@covid19-helpline/models";

const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

export const citySchema = new Schema({
  name: {type: String, required: [true, 'City name is required'], text: true},
  stateId: {type: Types.ObjectId, ref: DbCollection.state, required: [true, 'State name is required']},
  ...commonSchemaFields
}, schemaOptions);

// options
citySchema
  .set('toObject', {virtuals: true})
  .set('toJSON', {virtuals: true});

// virtual
citySchema
  .virtual('state', {
    ref: DbCollection.state,
    localField: 'stateId',
    foreignField: '_id'
  });

// plugins
citySchema
  .plugin(mongooseValidationErrorTransform, mongooseErrorTransformPluginOptions);
