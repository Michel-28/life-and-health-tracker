const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    value: {
      type: Number,
      default: 1
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

habitLogSchema.index({ user: 1, habit: 1, date: 1 });

module.exports = mongoose.model('HabitLog', habitLogSchema);

