import * as df from 'durable-functions';
import { AzureFunction, Context } from '@azure/functions';

const timerStart: AzureFunction = async function (context: Context): Promise<any> {
  try {
    context.log(`Timer trigger executed at ${new Date().toUTCString()}`);
    const client = df.getClient(context);
    const instanceId = await client.startNew('orchestrator');

    context.log(`Started orchestration with ID = '${instanceId}'.`);
  } catch (error) {
    context.log.error('An error occurred during excution of timer trigger. Error: ' + error);
  }
};

export default timerStart;
