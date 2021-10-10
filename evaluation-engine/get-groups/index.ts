import { AzureFunction, Context } from '@azure/functions';
import { Group } from '@duchynko/tipovacka-models';
import { getDatabase } from '../utils/database';

const activityFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  context.log('Starting to generate group ids.');

  try {
    await getDatabase();

    context.log('Fetching all groups from the database.');
    const groups = await Group.find({}, { _id: 1 });

    return JSON.stringify(groups);
  } catch (error) {
    context.log.error('An error happened while querying groups from the database.');
  }
};

export default activityFunction;
