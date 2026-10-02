import mongoose from 'mongoose';

import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';

let server;
let isShuttingDown = false;

const SHUTDOWN_TIMEOUT_MS = 10000;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(
    { signal },
    'Graceful shutdown started'
  );

  const forceShutdownTimer =
    setTimeout(() => {
      logger.error(
        'Graceful shutdown timeout exceeded. Forcing process exit.'
      );

      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          logger.info(
            'HTTP server closed'
          );

          resolve();
        });
      });
    }

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();

      logger.info(
        'MongoDB connection closed'
      );
    }

    clearTimeout(
      forceShutdownTimer
    );

    logger.info(
      'Graceful shutdown completed'
    );

    process.exit(0);
  } catch (error) {
    clearTimeout(
      forceShutdownTimer
    );

    logger.error(
      {
        err: error
      },
      'Error during graceful shutdown'
    );

    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(
      env.port,
      () => {
        logger.info(
          {
            port: env.port,
            environment: env.nodeEnv
          },
          'Server started'
        );
      }
    );

    server.on(
      'error',
      (error) => {
        logger.error(
          {
            err: error
          },
          'HTTP server error'
        );

        process.exit(1);
      }
    );
  } catch (error) {
    logger.error(
      {
        err: error
      },
      'Failed to start server'
    );

    process.exit(1);
  }
};

process.on(
  'SIGINT',
  () => gracefulShutdown('SIGINT')
);

process.on(
  'SIGTERM',
  () => gracefulShutdown('SIGTERM')
);

process.on(
  'uncaughtException',
  (error) => {
    logger.fatal(
      {
        err: error
      },
      'Uncaught exception'
    );

    gracefulShutdown(
      'uncaughtException'
    );
  }
);

process.on(
  'unhandledRejection',
  (reason) => {
    logger.fatal(
      {
        err: reason
      },
      'Unhandled promise rejection'
    );

    gracefulShutdown(
      'unhandledRejection'
    );
  }
);

startServer();