const mongoose = require('mongoose');

const mentalWellnessRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 7
    },
    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 4
    },
    mentalEnergy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 7
    },
    mentalFatigue: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    focus: {
      type: Number,
      default: 7,
      min: 1,
      max: 10
    },
    emotions: [{
      type: String,
      trim: true
    }],
    socialInteractionLevel: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High'],
      default: 'Moderate'
    },
    timeSpentAloneMinutes: {
      type: Number,
      default: 120,
      min: 0
    },
    relaxationActivities: [{
      type: String,
      trim: true
    }],
    reflection: {
      good: { type: String, default: '' },
      difficult: { type: String, default: '' },
      affectedMood: { type: String, default: '' },
      gratefulFor: { type: String, default: '' },
      improveTomorrow: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

mentalWellnessRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('MentalWellnessRecord', mentalWellnessRecordSchema);

