const express = require('express');
const router = express.Router();
const {
  getDigitalRecords,
  createDigitalRecord,
  updateDigitalRecord,
  deleteDigitalRecord,
  getDigitalAnalytics
} = require('../controllers/digitalWellnessController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getDigitalAnalytics);

router.route('/')
  .get(getDigitalRecords)
  .post(createDigitalRecord);

router.route('/:id')
  .put(updateDigitalRecord)
  .delete(deleteDigitalRecord);

module.exports = router;

