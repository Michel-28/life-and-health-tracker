const express = require('express');
const router = express.Router();
const {
  getSleepRecords,
  getSleepById,
  createSleep,
  updateSleep,
  deleteSleep,
  getSleepAnalytics
} = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getSleepAnalytics);

router.route('/')
  .get(getSleepRecords)
  .post(createSleep);

router.route('/:id')
  .get(getSleepById)
  .put(updateSleep)
  .delete(deleteSleep);

module.exports = router;

