const mongoose = require('mongoose');

const energyRecordSchema = new mongoose.Schema(
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
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Custom'],
      default: 'Morning'
    },
    entryTime: {
      type: String,
      default: '08:00'
    },
    physicalEnergy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 7
    },
    mentalEnergy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 7
    },
    freshness: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    },
    focus: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    },
    motivation: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    },
    muscleSoreness: {
      type: Number,
      min: 1,
      max: 10,
      default: 2
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

energyRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('EnergyRecord', energyRecordSchema);

