const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema(
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
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [300, 'Weight must be realistic']
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

weightRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WeightRecord', weightRecordSchema);

