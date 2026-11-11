const mongoose = require('mongoose');

const sleepRecordSchema = new mongoose.Schema(
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
    bedtime: {
      type: String,
      required: true,
      default: '23:00'
    },
    wakeTime: {
      type: String,
      required: true,
      default: '07:00'
    },
    durationHours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
      default: 8.0
    },
    timeToFallAsleepMinutes: {
      type: Number,
      default: 15,
      min: 0
    },
    awakenings: {
      type: Number,
      default: 0,
      min: 0
    },
    sleepQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 8
    },
    morningFreshness: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 8
    },
    napDurationMinutes: {
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

sleepRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SleepRecord', sleepRecordSchema);

