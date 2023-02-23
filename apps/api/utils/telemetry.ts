import * as appInsights from 'applicationinsights';

export const initializeTelemetry = () => {
  // Configure an Application Insights client
  appInsights
    .setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI);

  const defaultClientContext = appInsights.defaultClient.context;
  // Configure the role name
  defaultClientContext.tags[defaultClientContext.keys.cloudRole] =
    process.env.NODE_ENV === 'production' ? 'aca-tipovacka-api-prod' : 'aca-tipovacka-api-test';

  // Start the collecting telemetry and send it to Application Insights
  appInsights.start();

  appInsights.defaultClient.addTelemetryProcessor((envelope, context) => {
    if (context) {
      const req = context['http.ServerRequest'];

      if (req && req.user) {
        envelope.tags['ai.user.authUserId'] = req.user.username;
      }
    }

    return true;
  });
};
