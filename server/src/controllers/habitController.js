const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// @desc    Get user habits with today's status
// @route   GET /api/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const todayLogs = await HabitLog.find({
      user: req.user.id,
      date: { $gte: today, $lte: endToday }
    });

    const logMap = {};
    todayLogs.forEach((l) => {
      logMap[l.habit.toString()] = l;
    });

    const habitsWithTodayStatus = habits.map((h) => {
      const todayLog = logMap[h._id.toString()];
      return {
        ...h.toObject(),
        completedToday: todayLog ? todayLog.completed : false,
        todayValue: todayLog ? todayLog.value : 0
      };
    });

    res.status(200).json({ success: true, count: habitsWithTodayStatus.length, data: habitsWithTodayStatus });
  } catch (error) {
    next(error);
  }
};

// @desc    Create habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const habit = await Habit.create(req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete habit and its logs
// @route   DELETE /api/habits/:id
// @access  Private
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    await HabitLog.deleteMany({ habit: req.params.id, user: req.user.id });
    res.status(200).json({ success: true, message: 'Habit and logs deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or record habit completion
// @route   POST /api/habits/:id/toggle
// @access  Private
exports.toggleHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const targetDate = req.body.date ? new Date(req.body.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let log = await HabitLog.findOne({
      user: req.user.id,
      habit: habit._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (log) {
      log.completed = req.body.completed !== undefined ? req.body.completed : !log.completed;
      if (req.body.value !== undefined) log.value = req.body.value;
      await log.save();
    } else {
      log = await HabitLog.create({
        user: req.user.id,
        habit: habit._id,
        date: startOfDay,
        completed: req.body.completed !== undefined ? req.body.completed : true,
        value: req.body.value !== undefined ? req.body.value : habit.targetCount
      });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit analytics, calendar logs and consistency calculations
// @route   GET /api/habits/analytics
// @access  Private
exports.getHabitAnalytics = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id, active: true });
    const logs = await HabitLog.find({ user: req.user.id, completed: true }).sort({ date: 1 });

    // Date range: last 30 days
    const days = 30;
    const history = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const dayLogs = logs.filter((l) => l.date.toISOString().split('T')[0] === dStr);
      history.push({
        date: dStr,
        completedCount: dayLogs.length,
        totalHabits: habits.length,
        completionRate: habits.length > 0 ? Math.round((dayLogs.length / habits.length) * 100) : 0
      });
    }

    // Habit breakdown
    const habitStats = habits.map((h) => {
      const hLogs = logs.filter((l) => l.habit.toString() === h._id.toString());
      return {
        id: h._id,
        name: h.name,
        category: h.category,
        totalCompletions: hLogs.length,
        consistencyPct: Math.min(100, Math.round((hLogs.length / days) * 100))
      };
    });

    res.status(200).json({
      success: true,
      history,
      habitStats
    });
  } catch (error) {
    next(error);
  }
};

