import * as mongoose from 'mongoose';
import { exportModels } from '@duchynko/tipovacka-models';

let databaseInstance: mongoose.Mongoose;

const connect = async (uri: string) => {
  databaseInstance = await mongoose.connect(uri);
};

const DATABASE_URI = process.env.DB_CONNECTION_STRING || '';

export const getDatabase = async (
  uri: string = DATABASE_URI
): Promise<mongoose.Mongoose> => {
  if (!uri) {
    throw Error('Database URI not provided!');
  }

  if (!databaseInstance) {
    await connect(uri);
    exportModels(databaseInstance);
  }

  return databaseInstance;
};
