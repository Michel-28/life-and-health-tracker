const BodyMeasurement = require('../models/BodyMeasurement');

// @desc    Get body measurements
// @route   GET /api/measurements
// @access  Private
exports.getMeasurements = async (req, res, next) => {
  try {
    const measurements = await BodyMeasurement.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: measurements.length, data: measurements });
  } catch (error) {
    next(error);
  }
};

// @desc    Create body measurement
// @route   POST /api/measurements
// @access  Private
exports.createMeasurement = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const measurement = await BodyMeasurement.create(req.body);
    res.status(201).json({ success: true, data: measurement });
  } catch (error) {
    next(error);
  }
};

// @desc    Update measurement
// @route   PUT /api/measurements/:id
// @access  Private
exports.updateMeasurement = async (req, res, next) => {
  try {
    const measurement = await BodyMeasurement.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!measurement) {
      return res.status(404).json({ success: false, message: 'Measurement not found' });
    }
    res.status(200).json({ success: true, data: measurement });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete measurement
// @route   DELETE /api/measurements/:id
// @access  Private
exports.deleteMeasurement = async (req, res, next) => {
  try {
    const measurement = await BodyMeasurement.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!measurement) {
      return res.status(404).json({ success: false, message: 'Measurement not found' });
    }
    res.status(200).json({ success: true, message: 'Measurement deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get measurement progress and comparisons
// @route   GET /api/measurements/analytics
// @access  Private
exports.getMeasurementAnalytics = async (req, res, next) => {
  try {
    const records = await BodyMeasurement.find({ user: req.user.id }).sort({ date: 1 });

    const timeline = records.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      weight: r.weight,
      chest: r.chest,
      waist: r.waist,
      arms: r.arm,
      thighs: r.thigh,
      bodyFat: r.bodyFatPercentage
    }));

    // Before and latest comparison
    const initial = records.length > 0 ? records[0] : null;
    const latest = records.length > 0 ? records[records.length - 1] : null;

    res.status(200).json({
      success: true,
      totalEntries: records.length,
      initial,
      latest,
      timeline
    });
  } catch (error) {
    next(error);
  }
};

