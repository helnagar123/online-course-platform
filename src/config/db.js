import mongoose from 'mongoose';

import env from './env.js';
import logger from './logger.js';

mongoose.set(
  'sanitizeFilter',
  true
);

mongoose.set(
  'strictQuery',
  true
);

const connectDB = async () => {
  try {
    const connection =
      await mongoose.connect(
        env.mongodbUri,
        {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          minPoolSize: 2
        }
      );

    logger.info(
      {
        host: connection.connection.host,
        database:
          connection.connection.name
      },
      'MongoDB connected'
    );

    return connection;
  } catch (error) {
    logger.error(
      {
        err: error
      },
      'MongoDB connection failed'
    );

    throw error;
  }
};

export default connectDB;