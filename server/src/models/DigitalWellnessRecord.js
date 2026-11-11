const mongoose = require('mongoose');

const digitalWellnessRecordSchema = new mongoose.Schema(
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
    totalScreenTimeMinutes: { type: Number, default: 0, min: 0 },
    socialMediaMinutes: { type: Number, default: 0, min: 0 },
    entertainmentMinutes: { type: Number, default: 0, min: 0 },
    educationalMinutes: { type: Number, default: 0, min: 0 },
    phonePickups: { type: Number, default: 0, min: 0 },
    screenTimeBeforeBedMinutes: { type: Number, default: 0, min: 0 },
    appUsage: [
      {
        appName: { type: String, required: true },
        minutes: { type: Number, default: 0 }
      }
    ],
    notes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

digitalWellnessRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('DigitalWellnessRecord', digitalWellnessRecordSchema);

