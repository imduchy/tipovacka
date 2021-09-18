import * as df from 'durable-functions';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';

const timerTrigger: AzureFunction = async function (context: Context): Promise<any> {
  const client = df.getClient(context);
  const functionName = 'orchestrator';

  const instanceId = await client.startNew(functionName);
  context.log(`The orchestrator instance with id ${instanceId} was started.`);
  return;
};

export default timerTrigger;
