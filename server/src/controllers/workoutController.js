const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');

// @desc    Get workouts with filtering & pagination
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { startDate, endDate, category, limit = 50, page = 1 } = req.query;
    const query = { user: req.user.id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const workouts = await Workout.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user.id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const workout = await Workout.create(req.body);
    res.status(201).json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findOne({ _id: req.params.id, user: req.user.id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    Object.assign(workout, req.body);
    await workout.save(); // triggers pre('save') volume recalculation

    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive workout & strength analytics
// @route   GET /api/workouts/analytics
// @access  Private
exports.getWorkoutAnalytics = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: 1 });

    const muscleGroupCounts = {};
    const categoryCounts = {};
    const exerciseProgression = {}; // { exerciseName: [ { date, maxWeight, totalVolume, estimated1RM, maxReps } ] }
    let totalLifetimeVolume = 0;
    let totalLifetimeDuration = 0;
    const personalRecords = {}; // { exerciseName: { maxWeight, maxVolume, estimated1RM, date } }

    workouts.forEach((w) => {
      totalLifetimeDuration += Number(w.totalDurationMinutes) || 0;
      totalLifetimeVolume += Number(w.totalVolume) || 0;

      // Category count
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;

      // Exercise level analytics
      if (w.exercises && w.exercises.length > 0) {
        w.exercises.forEach((ex) => {
          const exName = ex.exerciseName.trim();
          const muscle = ex.muscleGroup || 'Other';
          muscleGroupCounts[muscle] = (muscleGroupCounts[muscle] || 0) + 1;

          if (!exerciseProgression[exName]) {
            exerciseProgression[exName] = [];
          }
          if (!personalRecords[exName]) {
            personalRecords[exName] = { maxWeight: 0, maxVolume: 0, estimated1RM: 0, date: w.date };
          }

          let sessionMaxWeight = 0;
          let sessionMaxReps = 0;
          let sessionVolume = ex.totalVolume || 0;
          let sessionMax1RM = 0;

          if (ex.sets && ex.sets.length > 0) {
            ex.sets.forEach((s) => {
              const weight = Number(s.weight) || 0;
              const reps = Number(s.reps) || 0;
              if (weight > sessionMaxWeight) sessionMaxWeight = weight;
              if (reps > sessionMaxReps) sessionMaxReps = reps;

              // Epley Formula for 1RM: Weight * (1 + reps / 30)
              if (reps > 0 && weight > 0) {
                const est1RM = Math.round(weight * (1 + reps / 30));
                if (est1RM > sessionMax1RM) sessionMax1RM = est1RM;
              }
            });
          }

          if (sessionMaxWeight > personalRecords[exName].maxWeight) {
            personalRecords[exName].maxWeight = sessionMaxWeight;
            personalRecords[exName].date = w.date;
          }
          if (sessionMax1RM > personalRecords[exName].estimated1RM) {
            personalRecords[exName].estimated1RM = sessionMax1RM;
          }
          if (sessionVolume > personalRecords[exName].maxVolume) {
            personalRecords[exName].maxVolume = sessionVolume;
          }

          exerciseProgression[exName].push({
            date: w.date.toISOString().split('T')[0],
            maxWeight: sessionMaxWeight,
            estimated1RM: sessionMax1RM,
            volume: sessionVolume,
            reps: sessionMaxReps
          });
        });
      }
    });

    // Volume over time (last 30 workouts)
    const volumeTimeline = workouts.slice(-30).map((w) => ({
      date: w.date.toISOString().split('T')[0],
      name: w.name,
      volume: w.totalVolume,
      duration: w.totalDurationMinutes,
      category: w.category
    }));

    res.status(200).json({
      success: true,
      totalWorkouts: workouts.length,
      totalLifetimeVolume,
      totalLifetimeDuration,
      categoryDistribution: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
      muscleGroupDistribution: Object.entries(muscleGroupCounts).map(([name, count]) => ({ name, count })),
      personalRecords,
      exerciseProgression,
      volumeTimeline
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exercises library
// @route   GET /api/workouts/exercises
// @access  Private
exports.getExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find({
      $or: [{ user: req.user.id }, { user: null }]
    }).sort({ name: 1 });

    res.status(200).json({ success: true, count: exercises.length, data: exercises });
  } catch (error) {
    next(error);
  }
};

// @desc    Add custom exercise to library
// @route   POST /api/workouts/exercises
// @access  Private
exports.createExercise = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    req.body.isCustom = true;
    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom exercise
// @route   DELETE /api/workouts/exercises/:id
// @access  Private
exports.deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found or cannot delete default exercise' });
    }
    res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    next(error);
  }
};

