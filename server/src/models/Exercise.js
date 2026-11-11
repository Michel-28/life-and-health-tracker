const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means global system exercise
      index: true
    },
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: [
        'Chest',
        'Back',
        'Shoulders',
        'Biceps',
        'Triceps',
        'Quadriceps',
        'Hamstrings',
        'Glutes',
        'Calves',
        'Core',
        'Full Body',
        'Cardio'
      ]
    },
    equipment: {
      type: String,
      default: 'Barbell',
      enum: ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Bands', 'Cardio Machine', 'None']
    },
    category: {
      type: String,
      default: 'Strength',
      enum: ['Strength', 'Cardio', 'Mobility', 'Olympic', 'Other']
    },
    instructions: {
      type: String,
      default: ''
    },
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

exerciseSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);

