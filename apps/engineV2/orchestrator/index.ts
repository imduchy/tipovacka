import * as df from 'durable-functions';

const orchestrator = df.orchestrator(function* (context) {
  const updateGameResponse = yield context.df.callActivity(
    'updateGame',
    '610e588d781739002fc69fb8'
  );

  context.log(`UpdateGameResponse: ${updateGameResponse}`);
});

export default orchestrator;
