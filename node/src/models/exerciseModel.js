import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Exercise Schema
const exerciseSchema = new Schema(
  {
    
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Exercise model
const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
