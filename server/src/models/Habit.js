const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Fitness',
        'Nutrition',
        'Sleep',
        'Personal care',
        'Mental wellness',
        'Lifestyle'
      ],
      default: 'Lifestyle'
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'specific_days'],
      default: 'daily'
    },
    specificDays: [{
      type: Number,
      min: 0,
      max: 6 // 0 is Sunday, 6 is Saturday
    }],
    targetCount: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      default: 'times'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

habitSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Habit', habitSchema);

