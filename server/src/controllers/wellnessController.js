const MentalWellnessRecord = require('../models/MentalWellnessRecord');

// @desc    Get mental wellness records
// @route   GET /api/wellness
// @access  Private
exports.getWellnessRecords = async (req, res, next) => {
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

    const records = await MentalWellnessRecord.find(query).sort({ date: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create mental wellness record
// @route   POST /api/wellness
// @access  Private
exports.createWellnessRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await MentalWellnessRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mental wellness record
// @route   PUT /api/wellness/:id
// @access  Private
exports.updateWellnessRecord = async (req, res, next) => {
  try {
    const record = await MentalWellnessRecord.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Wellness record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mental wellness record
// @route   DELETE /api/wellness/:id
// @access  Private
exports.deleteWellnessRecord = async (req, res, next) => {
  try {
    const record = await MentalWellnessRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Wellness record not found' });
    }
    res.status(200).json({ success: true, message: 'Wellness record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness analytics
// @route   GET /api/wellness/analytics
// @access  Private
exports.getWellnessAnalytics = async (req, res, next) => {
  try {
    const records = await MentalWellnessRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        averageMood: 0,
        averageStress: 0,
        averageMentalEnergy: 0,
        emotionCounts: {},
        trends: []
      });
    }

    const totalMood = records.reduce((s, r) => s + (r.mood || 0), 0);
    const totalStress = records.reduce((s, r) => s + (r.stress || 0), 0);
    const totalMentalEnergy = records.reduce((s, r) => s + (r.mentalEnergy || 0), 0);

    const emotionCounts = {};
    records.forEach((r) => {
      if (r.emotions && Array.isArray(r.emotions)) {
        r.emotions.forEach((emo) => {
          emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
        });
      }
    });

    const trends = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      mood: r.mood,
      stress: r.stress,
      mentalEnergy: r.mentalEnergy,
      focus: r.focus
    }));

    res.status(200).json({
      success: true,
      averageMood: Number((totalMood / records.length).toFixed(1)),
      averageStress: Number((totalStress / records.length).toFixed(1)),
      averageMentalEnergy: Number((totalMentalEnergy / records.length).toFixed(1)),
      emotionCounts,
      trends
    });
  } catch (error) {
    next(error);
  }
};

