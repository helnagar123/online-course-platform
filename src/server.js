import mongoose from 'mongoose';

import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await mongoose.connection.close();

          logger.info('MongoDB connection closed');

          process.exit(0);
        } catch (error) {
          logger.error(error, 'Error during graceful shutdown');
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();