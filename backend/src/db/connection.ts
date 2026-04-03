import mongoose from 'mongoose';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    const mongoUri = env.DATABASE_URL || 'mongodb://localhost:27017/tour-guide-db';
    
    await mongoose.connect(mongoUri);
    
    logger.info(`MongoDB connected successfully`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection failed: ${error}`);
  }
};
