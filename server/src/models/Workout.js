const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 }, // kg
  distance: { type: Number, default: 0 }, // km for cardio
  durationMinutes: { type: Number, default: 0 }, // for cardio / endurance
  rpe: { type: Number, min: 1, max: 10, default: 7 }, // rate of perceived exertion
  restSeconds: { type: Number, default: 90 },
  completed: { type: Boolean, default: true }
}, { _id: false });

const workoutExerciseSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  muscleGroup: { type: String, default: 'Full Body' },
  equipment: { type: String, default: 'Barbell' },
  isCardio: { type: Boolean, default: false },
  sets: [setSchema],
  totalVolume: { type: Number, default: 0 }, // sum of (weight * reps)
  notes: { type: String, default: '' }
}, { _id: true });

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Upper body',
        'Lower body',
        'Push',
        'Pull',
        'Legs',
        'Full body',
        'Core',
        'Cardio',
        'Running',
        'Sprinting',
        'Mobility',
        'Custom workout'
      ],
      default: 'Full body'
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    startTime: {
      type: String,
      default: '07:00'
    },
    endTime: {
      type: String,
      default: '08:00'
    },
    totalDurationMinutes: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
      default: 60
    },
    exercises: [workoutExerciseSchema],
    totalVolume: {
      type: Number,
      default: 0
    },
    generalNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

workoutSchema.index({ user: 1, date: -1 });

// Pre-save hook to compute volume per exercise and total volume
workoutSchema.pre('save', function (next) {
  let grandTotalVolume = 0;
  if (this.exercises && this.exercises.length > 0) {
    this.exercises.forEach((ex) => {
      let exVol = 0;
      if (ex.sets && ex.sets.length > 0) {
        ex.sets.forEach((s) => {
          if (!ex.isCardio) {
            exVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        });
      }
      ex.totalVolume = exVol;
      grandTotalVolume += exVol;
    });
  }
  this.totalVolume = grandTotalVolume;
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);

