const Workout = require('../models/Workout');
const SleepRecord = require('../models/SleepRecord');
const Meal = require('../models/Meal');
const WeightRecord = require('../models/WeightRecord');
const ActivityRecord = require('../models/ActivityRecord');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const MentalWellnessRecord = require('../models/MentalWellnessRecord');
const EnergyRecord = require('../models/EnergyRecord');
const BodyMeasurement = require('../models/BodyMeasurement');
const RecoveryRecord = require('../models/RecoveryRecord');
const DigitalWellnessRecord = require('../models/DigitalWellnessRecord');
const Goal = require('../models/Goal');

// Helper to get start and end of a given date (default today)
const getDayRange = (targetDate = new Date()) => {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get complete Main Dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start: todayStart, end: todayEnd } = getDayRange(new Date());

    // 1. Today's records in parallel
    const [
      todayWorkout,
      lastSleep,
      latestWeight,
      todayActivity,
      todayEnergy,
      todayWellness,
      habits,
      todayHabitLogs
    ] = await Promise.all([
      Workout.findOne({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }),
      SleepRecord.findOne({ user: userId }).sort({ date: -1 }),
      WeightRecord.findOne({ user: userId }).sort({ date: -1 }),
      ActivityRecord.findOne({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }),
      EnergyRecord.findOne({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }).sort({ createdAt: -1 }),
      MentalWellnessRecord.findOne({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }),
      Habit.find({ user: userId, active: true }),
      HabitLog.find({ user: userId, date: { $gte: todayStart, $lte: todayEnd }, completed: true })
    ]);

    // Habits calculation
    const totalHabits = habits.length;
    const completedHabitsCount = todayHabitLogs.length;
    const habitCompletionPct = totalHabits > 0 ? Math.round((completedHabitsCount / totalHabits) * 100) : 0;

    // 2. Weekly stats for trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [weeklyWorkouts, weeklySleep, weeklyWeights, weeklyEnergy, weeklyActivities] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      SleepRecord.find({ user: userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      WeightRecord.find({ user: userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      EnergyRecord.find({ user: userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      ActivityRecord.find({ user: userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 })
    ]);

    // Weekly averages
    const avgSleepHours = weeklySleep.length > 0
      ? Number((weeklySleep.reduce((acc, s) => acc + s.durationHours, 0) / weeklySleep.length).toFixed(1))
      : null;

    const avgSteps = weeklyActivities.length > 0
      ? Math.round(weeklyActivities.reduce((acc, a) => acc + (a.steps || 0), 0) / weeklyActivities.length)
      : 0;

    // Build Personalized Real Observations based on actual data
    const observations = [];
    if (weeklySleep.length >= 3 && avgSleepHours) {
      observations.push(`Your average sleep duration over the last 7 days was ${avgSleepHours} hours.`);
    }
    if (weeklyWorkouts.length > 0) {
      observations.push(`You completed ${weeklyWorkouts.length} workout session${weeklyWorkouts.length > 1 ? 's' : ''} this week.`);
    } else {
      observations.push('No workouts recorded yet this week. A short session can jumpstart your consistency.');
    }
    if (weeklyWeights.length >= 2) {
      const diff = Number((weeklyWeights[weeklyWeights.length - 1].weight - weeklyWeights[0].weight).toFixed(1));
      if (diff > 0) {
        observations.push(`Your weight is +${diff} kg compared to 7 days ago.`);
      } else if (diff < 0) {
        observations.push(`Your weight is ${diff} kg compared to 7 days ago.`);
      } else {
        observations.push('Your body weight has remained stable this week.');
      }
    }
    if (weeklyEnergy.length >= 3 && weeklySleep.length >= 3) {
      const goodSleepEnergy = weeklySleep.filter((s) => s.durationHours >= 7.5);
      if (goodSleepEnergy.length > 0) {
        observations.push('Your energy reports indicate consistent vitality on days following sufficient sleep.');
      }
    }
    if (observations.length === 0) {
      observations.push('Log your daily activities, sleep and energy to unlock personalized lifestyle patterns.');
    }

    // 3. Recent activity feed (latest records across modules)
    const [recentWorkouts, recentMeals, recentSleeps, recentWeights] = await Promise.all([
      Workout.find({ user: userId }).sort({ date: -1 }).limit(3),
      Meal.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(3),
      SleepRecord.find({ user: userId }).sort({ date: -1 }).limit(3),
      WeightRecord.find({ user: userId }).sort({ date: -1 }).limit(3)
    ]);

    // 4. Combined 7-day trend chart data
    const chartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      chartMap[dStr] = {
        date: dStr,
        sleepHours: null,
        steps: 0,
        physicalEnergy: null,
        mentalEnergy: null,
        workoutMins: 0
      };
    }

    weeklySleep.forEach((s) => {
      const d = s.date.toISOString().split('T')[0];
      if (chartMap[d]) chartMap[d].sleepHours = s.durationHours;
    });
    weeklyActivities.forEach((a) => {
      const d = a.date.toISOString().split('T')[0];
      if (chartMap[d]) chartMap[d].steps = a.steps || 0;
    });
    weeklyWorkouts.forEach((w) => {
      const d = w.date.toISOString().split('T')[0];
      if (chartMap[d]) chartMap[d].workoutMins = (chartMap[d].workoutMins || 0) + (w.totalDurationMinutes || 0);
    });
    weeklyEnergy.forEach((e) => {
      const d = e.date.toISOString().split('T')[0];
      if (chartMap[d]) {
        chartMap[d].physicalEnergy = e.physicalEnergy;
        chartMap[d].mentalEnergy = e.mentalEnergy;
      }
    });

    res.status(200).json({
      success: true,
      today: {
        date: new Date().toISOString().split('T')[0],
        weight: latestWeight ? latestWeight.weight : null,
        sleepDuration: lastSleep ? lastSleep.durationHours : null,
        sleepQuality: lastSleep ? lastSleep.sleepQuality : null,
        workoutDone: Boolean(todayWorkout),
        workoutDetails: todayWorkout || null,
        steps: todayActivity ? todayActivity.steps : 0,
        activeMinutes: todayActivity ? todayActivity.activeMinutes : 0,
        waterMl: todayActivity ? todayActivity.waterIntakeMl : 0,
        physicalEnergy: todayEnergy ? todayEnergy.physicalEnergy : null,
        mentalEnergy: todayEnergy ? todayEnergy.mentalEnergy : null,
        mood: todayWellness ? todayWellness.mood : null,
        habitCompletedCount: completedHabitsCount,
        habitTotalCount: totalHabits,
        habitPercentage: habitCompletionPct
      },
      weeklySummary: {
        workoutCount: weeklyWorkouts.length,
        avgSleepHours,
        avgSteps
      },
      observations,
      recentActivity: {
        workouts: recentWorkouts,
        meals: recentMeals,
        sleep: recentSleeps,
        weights: recentWeights
      },
      trends: Object.values(chartMap)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive Weekly Report
// @route   GET /api/analytics/weekly
// @access  Private
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const [workouts, sleep, meals, weights, activities, habits, habitLogs, energy, wellness] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: start, $lte: end } }),
      SleepRecord.find({ user: userId, date: { $gte: start, $lte: end } }),
      Meal.find({ user: userId, date: { $gte: start, $lte: end } }),
      WeightRecord.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      ActivityRecord.find({ user: userId, date: { $gte: start, $lte: end } }),
      Habit.find({ user: userId, active: true }),
      HabitLog.find({ user: userId, date: { $gte: start, $lte: end }, completed: true }),
      EnergyRecord.find({ user: userId, date: { $gte: start, $lte: end } }),
      MentalWellnessRecord.find({ user: userId, date: { $gte: start, $lte: end } })
    ]);

    const totalWorkoutDuration = workouts.reduce((s, w) => s + (w.totalDurationMinutes || 0), 0);
    const totalWorkoutVolume = workouts.reduce((s, w) => s + (w.totalVolume || 0), 0);
    const avgSleep = sleep.length > 0 ? Number((sleep.reduce((s, r) => s + r.durationHours, 0) / sleep.length).toFixed(1)) : 0;
    const avgCalories = meals.length > 0 ? Math.round(meals.reduce((s, m) => s + (m.totalCalories || 0), 0) / 7) : 0;
    const avgProtein = meals.length > 0 ? Math.round(meals.reduce((s, m) => s + (m.totalProtein || 0), 0) / 7) : 0;
    const avgSteps = activities.length > 0 ? Math.round(activities.reduce((s, a) => s + (a.steps || 0), 0) / activities.length) : 0;
    const avgPhysicalEnergy = energy.length > 0 ? Number((energy.reduce((s, e) => s + e.physicalEnergy, 0) / energy.length).toFixed(1)) : 0;
    const avgMentalEnergy = energy.length > 0 ? Number((energy.reduce((s, e) => s + e.mentalEnergy, 0) / energy.length).toFixed(1)) : 0;
    const avgMood = wellness.length > 0 ? Number((wellness.reduce((s, w) => s + w.mood, 0) / wellness.length).toFixed(1)) : 0;

    const startWeight = weights.length > 0 ? weights[0].weight : null;
    const endWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
    const weightChange = (startWeight !== null && endWeight !== null) ? Number((endWeight - startWeight).toFixed(1)) : 0;

    const habitConsistencyPct = habits.length > 0 ? Math.round((habitLogs.length / (habits.length * 7)) * 100) : 0;

    res.status(200).json({
      success: true,
      dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
      stats: {
        workoutCount: workouts.length,
        totalWorkoutDuration,
        totalWorkoutVolume,
        avgSleep,
        avgCalories,
        avgProtein,
        avgSteps,
        startWeight,
        endWeight,
        weightChange,
        habitConsistencyPct,
        avgPhysicalEnergy,
        avgMentalEnergy,
        avgMood
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Monthly Report with long term consistency
// @route   GET /api/analytics/monthly
// @access  Private
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const [workouts, sleep, weights, activities, energy] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: start, $lte: end } }),
      SleepRecord.find({ user: userId, date: { $gte: start, $lte: end } }),
      WeightRecord.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
      ActivityRecord.find({ user: userId, date: { $gte: start, $lte: end } }),
      EnergyRecord.find({ user: userId, date: { $gte: start, $lte: end } })
    ]);

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((s, w) => s + (w.totalVolume || 0), 0);
    const avgSleep = sleep.length > 0 ? Number((sleep.reduce((s, r) => s + r.durationHours, 0) / sleep.length).toFixed(1)) : 0;
    const avgSteps = activities.length > 0 ? Math.round(activities.reduce((s, a) => s + (a.steps || 0), 0) / activities.length) : 0;
    const avgEnergy = energy.length > 0 ? Number((energy.reduce((s, e) => s + e.physicalEnergy, 0) / energy.length).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      totalWorkouts,
      totalVolume,
      avgSleep,
      avgSteps,
      avgEnergy,
      weightPoints: weights.map((w) => ({ date: w.date.toISOString().split('T')[0], weight: w.weight }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export all user data in JSON format
// @route   GET /api/analytics/export
// @access  Private
exports.exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      workouts,
      sleepRecords,
      meals,
      weights,
      activities,
      habits,
      habitLogs,
      wellness,
      energy,
      measurements,
      recovery,
      digital,
      goals
    ] = await Promise.all([
      Workout.find({ user: userId }),
      SleepRecord.find({ user: userId }),
      Meal.find({ user: userId }),
      WeightRecord.find({ user: userId }),
      ActivityRecord.find({ user: userId }),
      Habit.find({ user: userId }),
      HabitLog.find({ user: userId }),
      MentalWellnessRecord.find({ user: userId }),
      EnergyRecord.find({ user: userId }),
      BodyMeasurement.find({ user: userId }),
      RecoveryRecord.find({ user: userId }),
      DigitalWellnessRecord.find({ user: userId }),
      Goal.find({ user: userId })
    ]);

    const fullExport = {
      exportedAt: new Date().toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      workouts,
      sleepRecords,
      meals,
      weights,
      activities,
      habits,
      habitLogs,
      wellness,
      energy,
      measurements,
      recovery,
      digital,
      goals
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=life_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.status(200).json(fullExport);
  } catch (error) {
    next(error);
  }
};

