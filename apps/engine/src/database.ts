import mongoose, { Mongoose } from 'mongoose';
import { exportModels } from '@tipovacka/models';

let databaseInstance: Mongoose;

const connect = async (uri: string) => {
  databaseInstance = await mongoose.connect(uri);
};

export const getDatabase = async (
  uri: string = process.env.DB_CONNECTION_STRING
): Promise<Mongoose> => {
  if (!databaseInstance) {
    await connect(uri);
    exportModels(databaseInstance);
  }

  return databaseInstance;
};
