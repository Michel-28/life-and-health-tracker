const mongoose = require('mongoose');

const activityRecordSchema = new mongoose.Schema(
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
    steps: {
      type: Number,
      default: 0,
      min: 0
    },
    walkingDistanceKm: {
      type: Number,
      default: 0,
      min: 0
    },
    runningDistanceKm: {
      type: Number,
      default: 0,
      min: 0
    },
    activeMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    sittingDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    standingDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    stretchingDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    mobilityDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    waterIntakeMl: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

activityRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ActivityRecord', activityRecordSchema);

