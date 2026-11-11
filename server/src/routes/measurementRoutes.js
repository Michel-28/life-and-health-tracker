const express = require('express');
const router = express.Router();
const {
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurementAnalytics
} = require('../controllers/measurementController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getMeasurementAnalytics);

router.route('/')
  .get(getMeasurements)
  .post(createMeasurement);

router.route('/:id')
  .put(updateMeasurement)
  .delete(deleteMeasurement);

module.exports = router;

