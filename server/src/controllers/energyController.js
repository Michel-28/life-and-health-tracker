const EnergyRecord = require('../models/EnergyRecord');
const SleepRecord = require('../models/SleepRecord');
const Workout = require('../models/Workout');
const MentalWellnessRecord = require('../models/MentalWellnessRecord');

// @desc    Get energy records
// @route   GET /api/energy
// @access  Private
exports.getEnergyRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 60 } = req.query;
    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await EnergyRecord.find(query).sort({ date: -1, entryTime: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create energy record
// @route   POST /api/energy
// @access  Private
exports.createEnergyRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await EnergyRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update energy record
// @route   PUT /api/energy/:id
// @access  Private
exports.updateEnergyRecord = async (req, res, next) => {
  try {
    const record = await EnergyRecord.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Energy record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete energy record
// @route   DELETE /api/energy/:id
// @access  Private
exports.deleteEnergyRecord = async (req, res, next) => {
  try {
    const record = await EnergyRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Energy record not found' });
    }
    res.status(200).json({ success: true, message: 'Energy record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get energy analytics & cross-module correlations
// @route   GET /api/energy/analytics
// @access  Private
exports.getEnergyAnalytics = async (req, res, next) => {
  try {
    const records = await EnergyRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        averagePhysical: 0,
        averageMental: 0,
        morningVsEvening: { morning: 0, evening: 0 },
        timeline: [],
        correlations: []
      });
    }

    const morningEntries = records.filter((r) => r.timeOfDay === 'Morning');
    const eveningEntries = records.filter((r) => r.timeOfDay === 'Evening');

    const avgMorning = morningEntries.length > 0
      ? Number((morningEntries.reduce((s, r) => s + r.physicalEnergy, 0) / morningEntries.length).toFixed(1))
      : 0;
    const avgEvening = eveningEntries.length > 0
      ? Number((eveningEntries.reduce((s, r) => s + r.physicalEnergy, 0) / eveningEntries.length).toFixed(1))
      : 0;

    const totalPhys = records.reduce((s, r) => s + r.physicalEnergy, 0);
    const totalMent = records.reduce((s, r) => s + r.mentalEnergy, 0);

    const timeline = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      timeOfDay: r.timeOfDay,
      physicalEnergy: r.physicalEnergy,
      mentalEnergy: r.mentalEnergy,
      freshness: r.freshness,
      muscleSoreness: r.muscleSoreness
    }));

    // Cross-module data
    const sleeps = await SleepRecord.find({ user: req.user.id });
    const workouts = await Workout.find({ user: req.user.id });
    const wellness = await MentalWellnessRecord.find({ user: req.user.id });

    const sleepMap = {};
    sleeps.forEach((s) => { sleepMap[s.date.toISOString().split('T')[0]] = s; });

    const workoutMap = {};
    workouts.forEach((w) => { workoutMap[w.date.toISOString().split('T')[0]] = w; });

    const wellnessMap = {};
    wellness.forEach((m) => { wellnessMap[m.date.toISOString().split('T')[0]] = m; });

    // Combine by date
    const dateSet = new Set(records.map((r) => r.date.toISOString().split('T')[0]));
    const correlations = Array.from(dateSet).slice(-20).map((dStr) => {
      const dayEnergy = records.filter((r) => r.date.toISOString().split('T')[0] === dStr);
      const avgDayPhysical = Number((dayEnergy.reduce((s, r) => s + r.physicalEnergy, 0) / dayEnergy.length).toFixed(1));
      const avgDayMental = Number((dayEnergy.reduce((s, r) => s + r.mentalEnergy, 0) / dayEnergy.length).toFixed(1));

      return {
        date: dStr,
        physicalEnergy: avgDayPhysical,
        mentalEnergy: avgDayMental,
        sleepDuration: sleepMap[dStr]?.durationHours || null,
        sleepQuality: sleepMap[dStr]?.sleepQuality || null,
        workoutVolume: workoutMap[dStr]?.totalVolume || null,
        stress: wellnessMap[dStr]?.stress || null
      };
    });

    res.status(200).json({
      success: true,
      averagePhysical: Number((totalPhys / records.length).toFixed(1)),
      averageMental: Number((totalMent / records.length).toFixed(1)),
      morningVsEvening: {
        morning: avgMorning,
        evening: avgEvening
      },
      timeline,
      correlations
    });
  } catch (error) {
    next(error);
  }
};

