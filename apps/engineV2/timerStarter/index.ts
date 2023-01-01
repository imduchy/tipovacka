import * as df from 'durable-functions';
import { AzureFunction, Context } from '@azure/functions';

const timerStart: AzureFunction = async function (context: Context): Promise<any> {
  const client = df.getClient(context);
  const instanceId = await client.startNew('orchestrator');

  context.log(`Started orchestration with ID = '${instanceId}'.`);
};

export default timerStart;
