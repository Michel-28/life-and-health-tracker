const express = require('express');
const router = express.Router();
const {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getNutritionAnalytics,
  getWeightRecords,
  createWeightRecord,
  deleteWeightRecord
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getNutritionAnalytics);

router.route('/weight')
  .get(getWeightRecords)
  .post(createWeightRecord);

router.delete('/weight/:id', deleteWeightRecord);

router.route('/')
  .get(getMeals)
  .post(createMeal);

router.route('/:id')
  .put(updateMeal)
  .delete(deleteMeal);

module.exports = router;

