const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutAnalytics,
  getExercises,
  createExercise,
  deleteExercise
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getWorkoutAnalytics);
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);
router.delete('/exercises/:id', deleteExercise);

router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

module.exports = router;

