import { Mongoose, connect } from 'mongoose';
import { exportModels } from '@tipovacka/models';

let databaseInstance: Mongoose;

export const getDatabase = async (connectionString: string): Promise<Mongoose> => {
  if (!databaseInstance) {
    databaseInstance = await connect(connectionString);
    exportModels(databaseInstance);
  }

  return databaseInstance;
};
