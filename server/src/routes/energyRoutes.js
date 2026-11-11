const express = require('express');
const router = express.Router();
const {
  getEnergyRecords,
  createEnergyRecord,
  updateEnergyRecord,
  deleteEnergyRecord,
  getEnergyAnalytics
} = require('../controllers/energyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getEnergyAnalytics);

router.route('/')
  .get(getEnergyRecords)
  .post(createEnergyRecord);

router.route('/:id')
  .put(updateEnergyRecord)
  .delete(deleteEnergyRecord);

module.exports = router;

