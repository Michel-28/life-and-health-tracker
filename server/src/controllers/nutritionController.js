const Meal = require('../models/Meal');
const WeightRecord = require('../models/WeightRecord');
const ActivityRecord = require('../models/ActivityRecord');
const UserSettings = require('../models/UserSettings');

// @desc    Get meals
// @route   GET /api/meals
// @access  Private
exports.getMeals = async (req, res, next) => {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query;
    const query = { user: req.user.id };

    if (category && category !== 'All') {
      query.mealCategory = category;
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

    const meals = await Meal.find(query).sort({ date: -1, mealTime: -1 }).limit(Number(limit));

    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
exports.createMeal = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
exports.updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    Object.assign(meal, req.body);
    await meal.save();

    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.status(200).json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition analytics (daily calorie/macro breakdown, progress vs targets)
// @route   GET /api/meals/analytics
// @access  Private
exports.getNutritionAnalytics = async (req, res, next) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user.id });
    const targets = settings?.dailyTargets || { calories: 2200, protein: 140, carbs: 250, fat: 70, waterMl: 2500 };

    // Get last 30 days meals
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const dailyMap = {};
    meals.forEach((m) => {
      const dateStr = m.date.toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 };
      }
      dailyMap[dateStr].calories += m.totalCalories || 0;
      dailyMap[dateStr].protein += m.totalProtein || 0;
      dailyMap[dateStr].carbs += m.totalCarbs || 0;
      dailyMap[dateStr].fat += m.totalFat || 0;
      dailyMap[dateStr].mealsCount += 1;
    });

    const dailyTrends = Object.values(dailyMap);

    // Today's totals
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySummary = dailyMap[todayStr] || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Also get today's water from activity records
    const todayActivity = await ActivityRecord.findOne({
      user: req.user.id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const waterIntake = todayActivity?.waterIntakeMl || 0;

    res.status(200).json({
      success: true,
      targets,
      today: {
        ...todaySummary,
        waterMl: waterIntake
      },
      dailyTrends
    });
  } catch (error) {
    next(error);
  }
};

// ================= WEIGHT TRACKING ================= //

// @desc    Get weight records with 7-day moving average
// @route   GET /api/meals/weight
// @access  Private
exports.getWeightRecords = async (req, res, next) => {
  try {
    const records = await WeightRecord.find({ user: req.user.id }).sort({ date: 1 });

    // Calculate 7-day moving average
    const recordsWithMA = records.map((rec, idx, arr) => {
      const sliceStart = Math.max(0, idx - 6);
      const window = arr.slice(sliceStart, idx + 1);
      const avg = window.reduce((sum, item) => sum + item.weight, 0) / window.length;
      return {
        _id: rec._id,
        date: rec.date.toISOString().split('T')[0],
        rawDate: rec.date,
        weight: rec.weight,
        movingAvg7Day: Number(avg.toFixed(2)),
        notes: rec.notes
      };
    });

    res.status(200).json({ success: true, count: recordsWithMA.length, data: recordsWithMA });
  } catch (error) {
    next(error);
  }
};

// @desc    Log weight
// @route   POST /api/meals/weight
// @access  Private
exports.createWeightRecord = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const record = await WeightRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete weight record
// @route   DELETE /api/meals/weight/:id
// @access  Private
exports.deleteWeightRecord = async (req, res, next) => {
  try {
    const record = await WeightRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Weight record not found' });
    }
    res.status(200).json({ success: true, message: 'Weight record deleted' });
  } catch (error) {
    next(error);
  }
};

