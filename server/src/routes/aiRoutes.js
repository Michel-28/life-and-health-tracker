const express = require('express');
const router = express.Router();
const {
  parseLog,
  confirmLog,
  askQuestion,
  getWeeklyInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/parse-log', parseLog);
router.post('/confirm-log', confirmLog);
router.post('/ask', askQuestion);
router.get('/insights', getWeeklyInsights);

module.exports = router;

