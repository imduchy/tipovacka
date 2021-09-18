import * as df from 'durable-functions';

const orchestrator = df.orchestrator(function* (context) {
  const result = yield context.df.callActivity('update-game');

  return result;
});

export default orchestrator;
