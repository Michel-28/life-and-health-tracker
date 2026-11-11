const express = require('express');
const router = express.Router();
const {
  getRecoveryRecords,
  createRecoveryRecord,
  updateRecoveryRecord,
  deleteRecoveryRecord,
  getRecoveryAnalytics
} = require('../controllers/recoveryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getRecoveryAnalytics);

router.route('/')
  .get(getRecoveryRecords)
  .post(createRecoveryRecord);

router.route('/:id')
  .put(updateRecoveryRecord)
  .delete(deleteRecoveryRecord);

module.exports = router;

