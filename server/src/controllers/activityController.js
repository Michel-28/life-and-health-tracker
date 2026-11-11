const ActivityRecord = require('../models/ActivityRecord');

// @desc    Get activity records
// @route   GET /api/activity
// @access  Private
exports.getActivities = async (req, res, next) => {
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

    const records = await ActivityRecord.find(query).sort({ date: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update activity for a given date
// @route   POST /api/activity
// @access  Private
exports.createActivity = async (req, res, next) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let record = await ActivityRecord.findOne({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (record) {
      Object.assign(record, req.body);
      await record.save();
      return res.status(200).json({ success: true, data: record });
    }

    req.body.user = req.user.id;
    record = await ActivityRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity record
// @route   DELETE /api/activity/:id
// @access  Private
exports.deleteActivity = async (req, res, next) => {
  try {
    const record = await ActivityRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Activity record not found' });
    }
    res.status(200).json({ success: true, message: 'Activity record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity analytics
// @route   GET /api/activity/analytics
// @access  Private
exports.getActivityAnalytics = async (req, res, next) => {
  try {
    const records = await ActivityRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        averageSteps: 0,
        averageActiveMinutes: 0,
        averageSittingHours: 0,
        activeDaysCount: 0,
        trends: []
      });
    }

    const totalSteps = records.reduce((sum, r) => sum + (r.steps || 0), 0);
    const totalActiveMins = records.reduce((sum, r) => sum + (r.activeMinutes || 0), 0);
    const totalSittingMins = records.reduce((sum, r) => sum + (r.sittingDurationMinutes || 0), 0);

    const averageSteps = Math.round(totalSteps / records.length);
    const averageActiveMinutes = Math.round(totalActiveMins / records.length);
    const averageSittingHours = Number((totalSittingMins / records.length / 60).toFixed(1));

    // Active days: days with >= 7,500 steps or >= 45 active minutes
    const activeDaysCount = records.filter((r) => r.steps >= 7500 || r.activeMinutes >= 45).length;

    const trends = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      steps: r.steps || 0,
      activeMinutes: r.activeMinutes || 0,
      sittingHours: Number(((r.sittingDurationMinutes || 0) / 60).toFixed(1)),
      waterMl: r.waterIntakeMl || 0,
      walkingDistanceKm: r.walkingDistanceKm || 0
    }));

    res.status(200).json({
      success: true,
      totalRecords: records.length,
      averageSteps,
      averageActiveMinutes,
      averageSittingHours,
      activeDaysCount,
      trends
    });
  } catch (error) {
    next(error);
  }
};

