import * as appInsights from 'applicationinsights';

export const initializeTelemetry = () => {
  // Configure an Application Insights client
  appInsights
    .setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI);

  const appInsightsContext = appInsights.defaultClient.context;

  // Configure the role name
  appInsightsContext.tags[appInsightsContext.keys.cloudRole] = 'aca-tipovacka-api-prod';

  // Start the collecting telemetry and send it to Application Insights
  appInsights.start();
};
