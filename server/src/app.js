const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const sleepRoutes = require('./routes/sleepRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const activityRoutes = require('./routes/activityRoutes');
const habitRoutes = require('./routes/habitRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const energyRoutes = require('./routes/energyRoutes');
const measurementRoutes = require('./routes/measurementRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');
const digitalRoutes = require('./routes/digitalRoutes');
const goalRoutes = require('./routes/goalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for React frontend bundle
}));

const allowedOrigins = [
  ...(env.CLIENT_URL ? env.CLIENT_URL.split(',').map((s) => s.trim()) : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check with system & database status
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      status: states[dbState] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    }
  });
});

const path = require('path');

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/meals', nutritionRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/digital', digitalRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Serve frontend in production or if client/dist exists
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
