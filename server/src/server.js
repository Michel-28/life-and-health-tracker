const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const mongoose = require('mongoose');

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`[LifeTracker Server] Running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n[LifeTracker Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[LifeTracker Server] Closed HTTP server.');
        try {
          await mongoose.disconnect();
          console.log('[MongoDB] Connection closed.');
          process.exit(0);
        } catch (err) {
          console.error(`[MongoDB] Error disconnecting: ${err.message}`);
          process.exit(1);
        }
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error('[LifeTracker Server] Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

