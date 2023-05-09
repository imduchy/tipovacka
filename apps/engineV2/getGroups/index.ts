import { AzureFunction, Context } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Group } from '@tipovacka/models';
import { getDatabase } from '../utils/database';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';

const activityFunction: AzureFunction = async function (context: Context): Promise<ReturnObject> {
  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const credentials = new DefaultAzureCredential();
  const secretClient = new SecretClient(keyVaultUrl, credentials);

  context.log('Fetching secrets from the Key Vault.');
  const connectionStringSecretName = process.env.CONNECTION_STRING_SECRET_NAME;
  const connectionStringSecret = await secretClient.getSecret(connectionStringSecretName);

  context.log('Getting the database object.');
  await getDatabase(connectionStringSecret.value);

  context.log('Fetching all group objects from the database.');
  const groups = await Group.find();

  return {
    code: ReturnCodes.GROUPS_FETCHED,
    data: groups,
  };
};

export default activityFunction;
