const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit,
  getHabitAnalytics
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getHabitAnalytics);
router.post('/:id/toggle', toggleHabit);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

module.exports = router;

