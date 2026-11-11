const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');

let token = '';

beforeAll(async () => {
  await mongoose.connect(env.MONGODB_URI);
  // Try logging in as demo user, or register if not yet created in the database
  let res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'demo@lifetracker.com', password: 'password123' });
  
  if (res.statusCode !== 200 || !res.body.token) {
    res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Demo User', email: 'demo@lifetracker.com', password: 'password123' });
  }
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Life & Health Tracker API Integration Tests', () => {
  it('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  it('GET /api/auth/me should return user details and settings', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toEqual('demo@lifetracker.com');
  });

  it('GET /api/analytics/dashboard should return real dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.today).toBeDefined();
    expect(res.body.observations.length).toBeGreaterThan(0);
  });

  it('POST /api/workouts should create a new workout session', async () => {
    const newWorkout = {
      name: 'Evening Upper Pump',
      category: 'Upper body',
      totalDurationMinutes: 50,
      exercises: [
        {
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          equipment: 'Dumbbell',
          sets: [
            { setNumber: 1, reps: 10, weight: 26, rpe: 8, restSeconds: 90 },
            { setNumber: 2, reps: 10, weight: 28, rpe: 9, restSeconds: 90 }
          ]
        }
      ]
    };

    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send(newWorkout);

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toEqual('Evening Upper Pump');
    expect(res.body.data.totalVolume).toEqual(26 * 10 + 28 * 10);
  });

  it('POST /api/ai/parse-log should extract entities from natural language', async () => {
    const res = await request(app)
      .post('/api/ai/parse-log')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'I slept at 11 PM, woke up at 7 AM, did a push workout for 45 mins and drank 2.5 litres of water.' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.extractedCount).toBeGreaterThanOrEqual(3);
    expect(res.body.preview.sleep).toBeDefined();
    expect(res.body.preview.workout).toBeDefined();
    expect(res.body.preview.activity).toBeDefined();
  });
});
