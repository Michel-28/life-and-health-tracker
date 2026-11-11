const mongoose = require('mongoose');

const recoveryRecordSchema = new mongoose.Schema(
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
    muscleSoreness: { type: Number, min: 1, max: 10, default: 3 },
    generalFatigue: { type: Number, min: 1, max: 10, default: 3 },
    sleepRecovery: { type: Number, min: 1, max: 10, default: 8 },
    workoutDifficulty: { type: Number, min: 1, max: 10, default: 6 },
    jointDiscomfort: { type: Number, min: 1, max: 10, default: 1 },
    isRestDay: { type: Boolean, default: false },
    readinessScore: { type: Number, min: 0, max: 100, default: 85 },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

recoveryRecordSchema.index({ user: 1, date: -1 });

// Automatically compute perceived readiness score if not provided
recoveryRecordSchema.pre('save', function (next) {
  if (!this.readinessScore || this.isModified('sleepRecovery') || this.isModified('generalFatigue') || this.isModified('muscleSoreness')) {
    // readiness calculated: high sleepRecovery, low fatigue, low soreness
    const base = (this.sleepRecovery * 10) - (this.generalFatigue * 4) - (this.muscleSoreness * 3) - (this.jointDiscomfort * 2);
    this.readinessScore = Math.min(100, Math.max(10, Math.round(base + 30)));
  }
  next();
});

module.exports = mongoose.model('RecoveryRecord', recoveryRecordSchema);

