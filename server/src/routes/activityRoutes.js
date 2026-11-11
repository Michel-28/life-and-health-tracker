const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  deleteActivity,
  getActivityAnalytics
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getActivityAnalytics);

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.delete('/:id', deleteActivity);

module.exports = router;

