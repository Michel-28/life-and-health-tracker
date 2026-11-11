const RecoveryRecord = require('../models/RecoveryRecord');

// @desc    Get recovery records
// @route   GET /api/recovery
// @access  Private
exports.getRecoveryRecords = async (req, res, next) => {
  try {
    const { limit = 60 } = req.query;
    const records = await RecoveryRecord.find({ user: req.user.id }).sort({ date: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recovery record
// @route   POST /api/recovery
// @access  Private
exports.createRecoveryRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await RecoveryRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recovery record
// @route   PUT /api/recovery/:id
// @access  Private
exports.updateRecoveryRecord = async (req, res, next) => {
  try {
    const record = await RecoveryRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Recovery record not found' });
    }
    Object.assign(record, req.body);
    await record.save();
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recovery record
// @route   DELETE /api/recovery/:id
// @access  Private
exports.deleteRecoveryRecord = async (req, res, next) => {
  try {
    const record = await RecoveryRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Recovery record not found' });
    }
    res.status(200).json({ success: true, message: 'Recovery record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recovery analytics
// @route   GET /api/recovery/analytics
// @access  Private
exports.getRecoveryAnalytics = async (req, res, next) => {
  try {
    const records = await RecoveryRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        averageReadiness: 0,
        averageFatigue: 0,
        averageSoreness: 0,
        restDaysCount: 0,
        trends: []
      });
    }

    const totalReadiness = records.reduce((s, r) => s + (r.readinessScore || 0), 0);
    const totalFatigue = records.reduce((s, r) => s + (r.generalFatigue || 0), 0);
    const totalSoreness = records.reduce((s, r) => s + (r.muscleSoreness || 0), 0);
    const restDaysCount = records.filter((r) => r.isRestDay).length;

    const trends = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      readinessScore: r.readinessScore,
      generalFatigue: r.generalFatigue,
      muscleSoreness: r.muscleSoreness,
      sleepRecovery: r.sleepRecovery,
      isRestDay: r.isRestDay
    }));

    res.status(200).json({
      success: true,
      averageReadiness: Math.round(totalReadiness / records.length),
      averageFatigue: Number((totalFatigue / records.length).toFixed(1)),
      averageSoreness: Number((totalSoreness / records.length).toFixed(1)),
      restDaysCount,
      trends
    });
  } catch (error) {
    next(error);
  }
};

