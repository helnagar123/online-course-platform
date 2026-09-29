import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongodbUri);

    logger.info(
      `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
    );
  } catch (error) {
    logger.error(error, 'MongoDB connection failed');
    throw error;
  }
};

export default connectDB;