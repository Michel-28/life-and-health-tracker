const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const isAtlas = env.MONGODB_URI.includes('mongodb.net') || env.MONGODB_URI.startsWith('mongodb+srv');
    
    console.log(`[MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cluster' : 'Local MongoDB'}...`);

    const options = {
      serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of hanging if Atlas network/IP is blocked
      autoIndex: true
    };

    const conn = await mongoose.connect(env.MONGODB_URI, options);
    
    const dbType = isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB';
    console.log(`[MongoDB] Connected successfully to ${dbType} (${conn.connection.host}/${conn.connection.name})`);

    // Listen for runtime connection events
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Reconnecting...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection restored.');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    
    if (env.MONGODB_URI.includes('mongodb.net') || env.MONGODB_URI.startsWith('mongodb+srv')) {
      console.error('\n--- MongoDB Atlas Connection Checklist ---');
      console.error('1. IP Access List: Ensure your IP address (or 0.0.0.0/0 for testing) is whitelisted in Atlas -> Network Access.');
      console.error('2. Database User: Ensure the database user and password in Atlas -> Database Access are correct.');
      console.error('3. Password Special Characters: If your password contains characters like @, :, or #, ensure they are URL-encoded.');
      console.error('4. Database Name: Ensure a database name is specified in your URI (e.g. mongodb.net/life_health_tracker?retryWrites=true)\n');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
