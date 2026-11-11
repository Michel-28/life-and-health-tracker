const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    units: {
      weight: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      },
      distance: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      },
      measurements: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    dailyTargets: {
      calories: { type: Number, default: 2200 },
      protein: { type: Number, default: 140 },
      carbs: { type: Number, default: 250 },
      fat: { type: Number, default: 70 },
      waterMl: { type: Number, default: 2500 },
      steps: { type: Number, default: 10000 },
      sleepDurationHours: { type: Number, default: 8.0 },
      targetWeight: { type: Number, default: 75 }
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);

