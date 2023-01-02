export const validateEnvVars = (
  requiredEnvVars: Record<string, string | undefined>
): Array<string> => {
  const undefinedRequiredEnv = [];

  for (const [k, v] of Object.entries<string | undefined>(requiredEnvVars)) {
    if (v === undefined) {
      undefinedRequiredEnv.push(k);
    }
  }

  return undefinedRequiredEnv;
};
