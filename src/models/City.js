import mongoose from 'mongoose';
import pointSchema from './Point';

let mongooseHidden = require('mongoose-hidden')();

const { Schema } = mongoose;

const citySchema = new Schema({
  twoCharCountryCode: {
    type: String,
    required: true
  },
  countryName: {
    type: String,
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  loc: {
    type: pointSchema,
    required: true
  }
});

// This will add `id` in toJSON
citySchema.set('toJSON', {
  virtuals: true
});

// This will remove `_id` and `__v`
citySchema.plugin(mongooseHidden);

export default mongoose.model('City', citySchema);
