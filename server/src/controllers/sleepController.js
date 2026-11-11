const SleepRecord = require('../models/SleepRecord');
const EnergyRecord = require('../models/EnergyRecord');

// Helper to compute duration in hours between bedtime (HH:mm) and wakeTime (HH:mm)
const calculateSleepDuration = (bedtime, wakeTime) => {
  if (!bedtime || !wakeTime) return 8.0;
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);

  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;

  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60; // crossed midnight
  }

  const diffMinutes = wakeMinutes - bedMinutes;
  return Number((diffMinutes / 60).toFixed(2));
};

// @desc    Get sleep records with filtering
// @route   GET /api/sleep
// @access  Private
exports.getSleepRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 60, page = 1 } = req.query;
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

    const skip = (Number(page) - 1) * Number(limit);
    const records = await SleepRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SleepRecord.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sleep record
// @route   GET /api/sleep/:id
// @access  Private
exports.getSleepById = async (req, res, next) => {
  try {
    const record = await SleepRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Sleep record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sleep record
// @route   POST /api/sleep
// @access  Private
exports.createSleep = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    if ((!req.body.durationHours || req.body.durationHours === 0) && req.body.bedtime && req.body.wakeTime) {
      req.body.durationHours = calculateSleepDuration(req.body.bedtime, req.body.wakeTime);
    }
    const record = await SleepRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sleep record
// @route   PUT /api/sleep/:id
// @access  Private
exports.updateSleep = async (req, res, next) => {
  try {
    let record = await SleepRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Sleep record not found' });
    }

    if (req.body.bedtime && req.body.wakeTime && !req.body.durationHours) {
      req.body.durationHours = calculateSleepDuration(req.body.bedtime, req.body.wakeTime);
    }

    Object.assign(record, req.body);
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sleep record
// @route   DELETE /api/sleep/:id
// @access  Private
exports.deleteSleep = async (req, res, next) => {
  try {
    const record = await SleepRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Sleep record not found' });
    }
    res.status(200).json({ success: true, message: 'Sleep record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sleep analytics, averages, trends and energy correlation
// @route   GET /api/sleep/analytics
// @access  Private
exports.getSleepAnalytics = async (req, res, next) => {
  try {
    const records = await SleepRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        totalRecords: 0,
        averageDuration: 0,
        averageQuality: 0,
        averageFreshness: 0,
        trends: [],
        correlation: []
      });
    }

    const totalDur = records.reduce((acc, r) => acc + (r.durationHours || 0), 0);
    const totalQual = records.reduce((acc, r) => acc + (r.sleepQuality || 0), 0);
    const totalFresh = records.reduce((acc, r) => acc + (r.morningFreshness || 0), 0);

    const averageDuration = Number((totalDur / records.length).toFixed(2));
    const averageQuality = Number((totalQual / records.length).toFixed(1));
    const averageFreshness = Number((totalFresh / records.length).toFixed(1));

    // Get last 30 days trends
    const trends = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      duration: r.durationHours,
      quality: r.sleepQuality,
      freshness: r.morningFreshness,
      bedtime: r.bedtime,
      wakeTime: r.wakeTime
    }));

    // Correlate with next day energy
    const energies = await EnergyRecord.find({ user: req.user.id }).sort({ date: 1 });
    const energyMap = {};
    energies.forEach((e) => {
      const d = e.date.toISOString().split('T')[0];
      if (!energyMap[d]) energyMap[d] = [];
      energyMap[d].push(e);
    });

    const correlation = trends.map((t) => {
      const match = energyMap[t.date];
      const avgEnergy = match && match.length > 0
        ? Number((match.reduce((a, b) => a + b.physicalEnergy, 0) / match.length).toFixed(1))
        : null;
      return {
        date: t.date,
        sleepDuration: t.duration,
        sleepQuality: t.quality,
        physicalEnergy: avgEnergy
      };
    }).filter((item) => item.physicalEnergy !== null);

    res.status(200).json({
      success: true,
      totalRecords: records.length,
      averageDuration,
      averageQuality,
      averageFreshness,
      trends,
      correlation
    });
  } catch (error) {
    next(error);
  }
};

