const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env reliably across any working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/life_health_tracker',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_life_tracker_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
