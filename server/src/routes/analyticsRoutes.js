const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getWeeklyReport,
  getMonthlyReport,
  exportUserData
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardOverview);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/export', exportUserData);

module.exports = router;

