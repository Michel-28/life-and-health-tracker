const express = require('express');
const router = express.Router();
const {
  getWellnessRecords,
  createWellnessRecord,
  updateWellnessRecord,
  deleteWellnessRecord,
  getWellnessAnalytics
} = require('../controllers/wellnessController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getWellnessAnalytics);

router.route('/')
  .get(getWellnessRecords)
  .post(createWellnessRecord);

router.route('/:id')
  .put(updateWellnessRecord)
  .delete(deleteWellnessRecord);

module.exports = router;

