const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fitness',
        'Weight',
        'Strength',
        'Sleep',
        'Nutrition',
        'Physical activity',
        'Mental wellness',
        'Habits'
      ],
      default: 'Fitness'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    targetDate: {
      type: Date,
      required: true
    },
    targetValue: {
      type: Number,
      required: true
    },
    currentValue: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      required: true,
      default: 'kg'
    },
    progressPercentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

goalSchema.index({ user: 1, status: 1 });

goalSchema.pre('save', function (next) {
  if (this.targetValue && this.targetValue !== 0) {
    const rawPct = (this.currentValue / this.targetValue) * 100;
    this.progressPercentage = Math.min(100, Math.max(0, Math.round(rawPct)));
    if (this.progressPercentage >= 100 && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);

