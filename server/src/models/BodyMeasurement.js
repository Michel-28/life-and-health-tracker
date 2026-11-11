const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema(
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
    weight: { type: Number, default: 0 },
    chest: { type: Number, default: 0 }, // cm
    waist: { type: Number, default: 0 }, // cm
    shoulder: { type: Number, default: 0 }, // cm
    arm: { type: Number, default: 0 }, // cm
    thigh: { type: Number, default: 0 }, // cm
    calf: { type: Number, default: 0 }, // cm
    bodyFatPercentage: { type: Number, default: 0 },
    photoUrl: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

bodyMeasurementSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);

