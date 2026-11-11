const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const SleepRecord = require('../models/SleepRecord');
const Meal = require('../models/Meal');
const WeightRecord = require('../models/WeightRecord');
const ActivityRecord = require('../models/ActivityRecord');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const MentalWellnessRecord = require('../models/MentalWellnessRecord');
const EnergyRecord = require('../models/EnergyRecord');
const BodyMeasurement = require('../models/BodyMeasurement');
const RecoveryRecord = require('../models/RecoveryRecord');
const DigitalWellnessRecord = require('../models/DigitalWellnessRecord');
const Goal = require('../models/Goal');

const defaultExercises = [
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', category: 'Strength', instructions: 'Lie on flat bench, grip bar slightly wider than shoulder width, lower bar to mid-chest, press upward.' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', category: 'Strength', instructions: 'Set bench to 30-45 degrees, press dumbbells upward focusing on upper pectorals.' },
  { name: 'Barbell Back Squat', muscleGroup: 'Quadriceps', equipment: 'Barbell', category: 'Strength', instructions: 'Rest bar on upper traps, descend hips back and down to parallel, drive through heels.' },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', category: 'Strength', instructions: 'Hinge at the hips with slight knee bend, lower bar along shins, squeeze glutes to return.' },
  { name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', category: 'Strength', instructions: 'Overhand grip, pull elbows down to ribs until chin clears bar.' },
  { name: 'Barbell Bent-Over Row', muscleGroup: 'Back', equipment: 'Barbell', category: 'Strength', instructions: 'Hinge torso at 45 degrees, pull barbell into lower ribcage keeping core braced.' },
  { name: 'Overhead Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Barbell', category: 'Strength', instructions: 'Stand tall with core tight, press barbell overhead from upper chest to full lockout.' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', category: 'Strength', instructions: 'Raise dumbbells outward with slight elbow bend to shoulder height.' },
  { name: 'Barbell Bicep Curl', muscleGroup: 'Biceps', equipment: 'Barbell', category: 'Strength', instructions: 'Curl barbell up with elbows pinned to sides.' },
  { name: 'Tricep Rope Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', category: 'Strength', instructions: 'Extend elbows downwards, flare rope outward at the bottom contraction.' },
  { name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', category: 'Strength', instructions: 'Hold prone forearm plank maintaining neutral spine and tight glutes.' },
  { name: 'Interval Sprinting', muscleGroup: 'Full Body', equipment: 'None', category: 'Cardio', instructions: 'High intensity 100m sprint intervals with active rest walks.' },
  { name: 'Outdoor Running', muscleGroup: 'Cardio', equipment: 'None', category: 'Cardio', instructions: 'Steady-state aerobic zone 2 running.' },
  { name: 'Morning Mobility Flow', muscleGroup: 'Full Body', equipment: 'None', category: 'Mobility', instructions: 'Hip openers, thoracic rotations, and hamstring lengthening drills.' }
];

const seed = async () => {
  try {
    const isAtlas = env.MONGODB_URI.includes('mongodb.net') || env.MONGODB_URI.startsWith('mongodb+srv');
    console.log(`[Seed] Connecting to ${isAtlas ? 'MongoDB Atlas Cluster' : 'Local MongoDB'}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: true
    });
    console.log(`[Seed] Connected to ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'} successfully!`);

    console.log('[Seed] Cleaning existing test collections...');
    await Promise.all([
      User.deleteMany({ email: { $in: ['demo@lifetracker.com', 'user1@lifetracker.com', 'user2@lifetracker.com', 'user3@lifetracker.com'] } }),
      Exercise.deleteMany({ user: null })
    ]);

    console.log('[Seed] Inserting default exercise library...');
    await Exercise.insertMany(defaultExercises.map((e) => ({ ...e, user: null, isCustom: false })));

    console.log('[Seed] Creating 3 test users...');
    const user1 = await User.create({
      name: 'Alex Mercer',
      email: 'user1@lifetracker.com',
      password: 'password123'
    });

    const user2 = await User.create({
      name: 'Sarah Connor',
      email: 'user2@lifetracker.com',
      password: 'password123'
    });

    const user3 = await User.create({
      name: 'David Miller',
      email: 'user3@lifetracker.com',
      password: 'password123'
    });

    // Also support demo@lifetracker.com
    await User.create({
      name: 'Demo User',
      email: 'demo@lifetracker.com',
      password: 'password123'
    });

    const demoUser = user1;

    await Promise.all([
      UserSettings.create({
        user: user1._id,
        units: { weight: 'kg', distance: 'km', measurements: 'cm' },
        dailyTargets: { calories: 2350, protein: 155, carbs: 260, fat: 70, waterMl: 3000, steps: 10000, sleepDurationHours: 8.0, targetWeight: 74.0 },
        theme: 'dark'
      }),
      UserSettings.create({
        user: user2._id,
        units: { weight: 'kg', distance: 'km', measurements: 'cm' },
        dailyTargets: { calories: 2000, protein: 130, carbs: 220, fat: 60, waterMl: 2500, steps: 8000, sleepDurationHours: 8.0, targetWeight: 62.0 },
        theme: 'dark'
      }),
      UserSettings.create({
        user: user3._id,
        units: { weight: 'kg', distance: 'km', measurements: 'cm' },
        dailyTargets: { calories: 2600, protein: 175, carbs: 290, fat: 80, waterMl: 3500, steps: 12000, sleepDurationHours: 8.5, targetWeight: 80.0 },
        theme: 'light'
      })
    ]);

    console.log('[Seed] Creating 30 days of realistic history...');
    const now = new Date();
    const workoutDocs = [];
    const sleepDocs = [];
    const mealDocs = [];
    const weightDocs = [];
    const activityDocs = [];
    const wellnessDocs = [];
    const energyDocs = [];
    const recoveryDocs = [];
    const digitalDocs = [];

    // Base habits
    const habits = await Habit.insertMany([
      { user: demoUser._id, name: 'Drink 3L Water', category: 'Nutrition', targetCount: 3000, unit: 'ml', frequency: 'daily' },
      { user: demoUser._id, name: '10,000 Daily Steps', category: 'Fitness', targetCount: 10000, unit: 'steps', frequency: 'daily' },
      { user: demoUser._id, name: 'Read 20 Mins', category: 'Personal care', targetCount: 20, unit: 'minutes', frequency: 'daily' },
      { user: demoUser._id, name: '10 Min Morning Mobility', category: 'Fitness', targetCount: 10, unit: 'minutes', frequency: 'daily' },
      { user: demoUser._id, name: 'Sleep Before 11:30 PM', category: 'Sleep', targetCount: 1, unit: 'times', frequency: 'daily' }
    ]);

    const habitLogDocs = [];

    let currentWeight = 77.2;

    for (let i = 29; i >= 0; i--) {
      const recordDate = new Date(now);
      recordDate.setDate(recordDate.getDate() - i);
      const isWeekend = recordDate.getDay() === 0 || recordDate.getDay() === 6;

      // Sleep
      const sleepHours = isWeekend ? 8.4 : 7.2 + (Math.sin(i) * 0.5);
      const quality = Math.min(10, Math.max(6, Math.round(7 + Math.sin(i) * 2)));
      sleepDocs.push({
        user: demoUser._id,
        date: recordDate,
        bedtime: isWeekend ? '23:45' : '23:15',
        wakeTime: isWeekend ? '08:15' : '06:45',
        durationHours: Number(sleepHours.toFixed(1)),
        timeToFallAsleepMinutes: 12 + (i % 8),
        awakenings: i % 4 === 0 ? 1 : 0,
        sleepQuality: quality,
        morningFreshness: quality,
        napDurationMinutes: isWeekend ? 25 : 0,
        notes: isWeekend ? 'Deep weekend sleep cycle' : 'Good standard weekday rest'
      });

      // Weight (healthy gradual trend down towards 74.5)
      currentWeight -= (0.07 + (Math.sin(i) * 0.04));
      weightDocs.push({
        user: demoUser._id,
        date: recordDate,
        weight: Number(currentWeight.toFixed(1)),
        notes: 'Morning weigh-in after waking'
      });

      // Activity
      const steps = isWeekend ? 11200 : 8500 + ((i * 180) % 3500);
      activityDocs.push({
        user: demoUser._id,
        date: recordDate,
        steps,
        walkingDistanceKm: Number((steps * 0.00078).toFixed(2)),
        runningDistanceKm: i % 3 === 0 ? 3.5 : 0,
        activeMinutes: 45 + (i % 25),
        sittingDurationMinutes: isWeekend ? 320 : 440,
        standingDurationMinutes: 140,
        stretchingDurationMinutes: 15,
        waterIntakeMl: 2600 + ((i * 120) % 800),
        notes: 'Consistent daily walking and posture check'
      });

      // Workouts (4 days per week: Push, Pull, Legs, Upper)
      if (i % 7 === 1 || i % 7 === 3 || i % 7 === 5 || i % 7 === 6) {
        const catMap = { 1: 'Push', 3: 'Pull', 5: 'Legs', 6: 'Full body' };
        const cat = catMap[i % 7] || 'Upper body';
        const weightProg = Math.round(70 + (29 - i) * 0.5);

        workoutDocs.push({
          user: demoUser._id,
          name: `${cat} Strength Session`,
          category: cat,
          date: recordDate,
          startTime: '07:30',
          endTime: '08:35',
          totalDurationMinutes: 65,
          exercises: [
            {
              exerciseName: cat === 'Push' ? 'Barbell Bench Press' : cat === 'Pull' ? 'Barbell Bent-Over Row' : 'Barbell Back Squat',
              muscleGroup: cat === 'Push' ? 'Chest' : cat === 'Pull' ? 'Back' : 'Quadriceps',
              equipment: 'Barbell',
              isCardio: false,
              sets: [
                { setNumber: 1, reps: 10, weight: weightProg - 10, rpe: 7, restSeconds: 90 },
                { setNumber: 2, reps: 8, weight: weightProg, rpe: 8, restSeconds: 120 },
                { setNumber: 3, reps: 8, weight: weightProg, rpe: 8.5, restSeconds: 120 },
                { setNumber: 4, reps: 6, weight: weightProg + 2.5, rpe: 9, restSeconds: 120 }
              ]
            },
            {
              exerciseName: cat === 'Push' ? 'Overhead Shoulder Press' : cat === 'Pull' ? 'Pull-Up' : 'Romanian Deadlift',
              muscleGroup: cat === 'Push' ? 'Shoulders' : cat === 'Pull' ? 'Back' : 'Hamstrings',
              equipment: cat === 'Pull' ? 'Bodyweight' : 'Barbell',
              isCardio: false,
              sets: [
                { setNumber: 1, reps: 10, weight: 40, rpe: 7, restSeconds: 90 },
                { setNumber: 2, reps: 10, weight: 42.5, rpe: 8, restSeconds: 90 },
                { setNumber: 3, reps: 8, weight: 45, rpe: 8.5, restSeconds: 90 }
              ]
            }
          ],
          generalNotes: 'Great mind-muscle connection and progressive overload.'
        });
      }

      // Meals
      mealDocs.push(
        {
          user: demoUser._id,
          mealCategory: 'Breakfast',
          date: recordDate,
          mealTime: '08:45',
          foods: [
            { name: 'Oatmeal with berries and whey', quantity: 1, unit: 'bowl', calories: 480, protein: 35, carbs: 65, fat: 8 },
            { name: 'Black Coffee', quantity: 1, unit: 'cup', calories: 5, protein: 0, carbs: 1, fat: 0 }
          ]
        },
        {
          user: demoUser._id,
          mealCategory: 'Lunch',
          date: recordDate,
          mealTime: '13:00',
          foods: [
            { name: 'Grilled Chicken Breast', quantity: 200, unit: 'grams', calories: 330, protein: 62, carbs: 0, fat: 7 },
            { name: 'Brown Rice & Steamed Broccoli', quantity: 1, unit: 'plate', calories: 380, protein: 10, carbs: 75, fat: 4 }
          ]
        },
        {
          user: demoUser._id,
          mealCategory: 'Dinner',
          date: recordDate,
          mealTime: '19:30',
          foods: [
            { name: 'Salmon Fillet with Sweet Potato', quantity: 1, unit: 'serving', calories: 620, protein: 44, carbs: 55, fat: 22 },
            { name: 'Mixed Leaf Salad with Olive Oil', quantity: 1, unit: 'bowl', calories: 150, protein: 2, carbs: 8, fat: 12 }
          ]
        }
      );

      // Habits logging
      habits.forEach((h, hIdx) => {
        // complete 85% of habits
        if ((i + hIdx) % 7 !== 0) {
          habitLogDocs.push({
            user: demoUser._id,
            habit: h._id,
            date: recordDate,
            completed: true,
            value: h.targetCount
          });
        }
      });

      // Mental wellness & Daily reflection
      wellnessDocs.push({
        user: demoUser._id,
        date: recordDate,
        mood: 7 + (i % 3),
        stress: 4 + (i % 4),
        mentalEnergy: 7 + (i % 3),
        mentalFatigue: 3 + (i % 3),
        focus: 8,
        emotions: ['Calm', 'Motivated', 'Neutral'],
        socialInteractionLevel: 'Moderate',
        timeSpentAloneMinutes: 120,
        relaxationActivities: ['Reading', 'Walking in nature', 'Meditation'],
        reflection: {
          good: 'Accomplished key tasks and stayed consistent with nutrition.',
          difficult: 'Felt slight afternoon fatigue during long meetings.',
          affectedMood: 'Sunny weather and productive workout.',
          gratefulFor: 'Good health, clear mind, and supportive family.',
          improveTomorrow: 'Remember to disconnect from screens earlier in the evening.'
        }
      });

      // Multi-time Energy entries
      energyDocs.push(
        {
          user: demoUser._id,
          date: recordDate,
          timeOfDay: 'Morning',
          entryTime: '08:00',
          physicalEnergy: 8,
          mentalEnergy: 8,
          freshness: 8,
          focus: 8,
          motivation: 8,
          muscleSoreness: 2,
          notes: 'High morning alertness'
        },
        {
          user: demoUser._id,
          date: recordDate,
          timeOfDay: 'Evening',
          entryTime: '20:30',
          physicalEnergy: 6,
          mentalEnergy: 7,
          freshness: 6,
          focus: 6,
          motivation: 7,
          muscleSoreness: 3,
          notes: 'Pleasant evening wind-down'
        }
      );

      // Recovery record
      recoveryDocs.push({
        user: demoUser._id,
        date: recordDate,
        muscleSoreness: 3,
        generalFatigue: 3,
        sleepRecovery: 8,
        workoutDifficulty: 7,
        jointDiscomfort: 1,
        isRestDay: !(i % 7 === 1 || i % 7 === 3 || i % 7 === 5 || i % 7 === 6),
        notes: 'Healthy recovery metrics'
      });

      // Digital wellness
      digitalDocs.push({
        user: demoUser._id,
        date: recordDate,
        totalScreenTimeMinutes: isWeekend ? 190 : 310,
        socialMediaMinutes: 45,
        entertainmentMinutes: 60,
        educationalMinutes: 120,
        phonePickups: 35,
        screenTimeBeforeBedMinutes: 20,
        appUsage: [
          { appName: 'VS Code & Terminals', minutes: 120 },
          { appName: 'Documentation & Books', minutes: 60 },
          { appName: 'Messaging & Family', minutes: 40 }
        ],
        notes: 'Kept social feeds low and educational screen time high'
      });
    }

    // Insert documents sequentially to ensure stable network transfer to Atlas
    console.log('[Seed] Saving sleep records...');
    await SleepRecord.insertMany(sleepDocs);
    console.log('[Seed] Saving weight records...');
    await WeightRecord.insertMany(weightDocs);
    console.log('[Seed] Saving activity records...');
    await ActivityRecord.insertMany(activityDocs);
    console.log('[Seed] Saving workout sessions...');
    await Workout.insertMany(workoutDocs);
    console.log('[Seed] Saving meal logs...');
    await Meal.insertMany(mealDocs);
    console.log('[Seed] Saving habit logs...');
    await HabitLog.insertMany(habitLogDocs);
    console.log('[Seed] Saving wellness records...');
    await MentalWellnessRecord.insertMany(wellnessDocs);
    console.log('[Seed] Saving energy entries...');
    await EnergyRecord.insertMany(energyDocs);
    console.log('[Seed] Saving recovery records...');
    await RecoveryRecord.insertMany(recoveryDocs);
    console.log('[Seed] Saving digital wellness records...');
    await DigitalWellnessRecord.insertMany(digitalDocs);

    // Initial and recent Body Measurements
    await BodyMeasurement.insertMany([
      {
        user: demoUser._id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        weight: 77.2,
        chest: 104,
        waist: 86,
        shoulder: 120,
        arm: 36.5,
        thigh: 58.5,
        calf: 37,
        bodyFatPercentage: 17.5,
        notes: 'Initial starting measurement check'
      },
      {
        user: demoUser._id,
        date: new Date(),
        weight: 74.8,
        chest: 105.5,
        waist: 82.5,
        shoulder: 122,
        arm: 37.8,
        thigh: 59.2,
        calf: 37.2,
        bodyFatPercentage: 14.8,
        notes: '1 month check: leaner waist, fuller chest and arms!'
      }
    ]);

    // Active Goals
    await Goal.insertMany([
      {
        user: demoUser._id,
        title: 'Reach 74.0 kg Target Bodyweight',
        description: 'Lean muscle definition while maintaining high training energy.',
        category: 'Weight',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        targetValue: 74.0,
        currentValue: 74.8,
        unit: 'kg',
        status: 'active'
      },
      {
        user: demoUser._id,
        title: 'Bench Press 90kg for 5 Reps',
        description: 'Strength milestone on compound chest movement.',
        category: 'Strength',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        targetValue: 90,
        currentValue: 82.5,
        unit: 'kg',
        status: 'active'
      },
      {
        user: demoUser._id,
        title: 'Maintain 8 Hours Sleep Average',
        description: 'Consistent sleep discipline and circadian alignment.',
        category: 'Sleep',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetValue: 8.0,
        currentValue: 7.7,
        unit: 'hours',
        status: 'active'
      }
    ]);

    console.log('[Seed] Database successfully seeded with 3 users and comprehensive health data!');
    console.log('[Seed] User Credentials:');
    console.log('       User 1:  user1@lifetracker.com  |  Password: password123');
    console.log('       User 2:  user2@lifetracker.com  |  Password: password123');
    console.log('       User 3:  user3@lifetracker.com  |  Password: password123');
    process.exit(0);
  } catch (err) {
    console.error(`[Seed] Error: ${err.message}`);
    process.exit(1);
  }
};

seed();

