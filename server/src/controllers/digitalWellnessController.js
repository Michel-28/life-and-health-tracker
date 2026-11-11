const DigitalWellnessRecord = require('../models/DigitalWellnessRecord');

// @desc    Get digital wellness records
// @route   GET /api/digital
// @access  Private
exports.getDigitalRecords = async (req, res, next) => {
  try {
    const { limit = 60 } = req.query;
    const records = await DigitalWellnessRecord.find({ user: req.user.id }).sort({ date: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create digital wellness record
// @route   POST /api/digital
// @access  Private
exports.createDigitalRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await DigitalWellnessRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update digital wellness record
// @route   PUT /api/digital/:id
// @access  Private
exports.updateDigitalRecord = async (req, res, next) => {
  try {
    const record = await DigitalWellnessRecord.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete digital wellness record
// @route   DELETE /api/digital/:id
// @access  Private
exports.deleteDigitalRecord = async (req, res, next) => {
  try {
    const record = await DigitalWellnessRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get digital wellness analytics
// @route   GET /api/digital/analytics
// @access  Private
exports.getDigitalAnalytics = async (req, res, next) => {
  try {
    const records = await DigitalWellnessRecord.find({ user: req.user.id }).sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        averageScreenTimeHours: 0,
        averageBedtimeScreenMinutes: 0,
        categoryDistribution: [],
        trends: []
      });
    }

    const totalScreenMinutes = records.reduce((s, r) => s + (r.totalScreenTimeMinutes || 0), 0);
    const totalBedtimeMinutes = records.reduce((s, r) => s + (r.screenTimeBeforeBedMinutes || 0), 0);
    const totalSocial = records.reduce((s, r) => s + (r.socialMediaMinutes || 0), 0);
    const totalEntertainment = records.reduce((s, r) => s + (r.entertainmentMinutes || 0), 0);
    const totalEducation = records.reduce((s, r) => s + (r.educationalMinutes || 0), 0);

    const averageScreenTimeHours = Number((totalScreenMinutes / records.length / 60).toFixed(1));
    const averageBedtimeScreenMinutes = Math.round(totalBedtimeMinutes / records.length);

    const categoryDistribution = [
      { name: 'Social Media', value: totalSocial },
      { name: 'Entertainment', value: totalEntertainment },
      { name: 'Educational/Work', value: totalEducation },
      { name: 'Other', value: Math.max(0, totalScreenMinutes - totalSocial - totalEntertainment - totalEducation) }
    ];

    const trends = records.slice(-30).map((r) => ({
      date: r.date.toISOString().split('T')[0],
      totalHours: Number(((r.totalScreenTimeMinutes || 0) / 60).toFixed(1)),
      socialMinutes: r.socialMediaMinutes || 0,
      bedtimeMinutes: r.screenTimeBeforeBedMinutes || 0,
      phonePickups: r.phonePickups || 0
    }));

    res.status(200).json({
      success: true,
      averageScreenTimeHours,
      averageBedtimeScreenMinutes,
      categoryDistribution,
      trends
    });
  } catch (error) {
    next(error);
  }
};

