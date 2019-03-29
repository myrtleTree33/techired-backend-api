import mongoose from 'mongoose';

const { Schema } = mongoose;

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

// export default mongoose.model('Point', pointSchema);
export default pointSchema;
