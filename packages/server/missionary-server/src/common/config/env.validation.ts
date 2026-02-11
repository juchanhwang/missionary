export function validateEnv(config: Record<string, unknown>) {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'AES_ENCRYPT_KEY',
  ];

  const missingVars = requiredVars.filter((v) => !config[v]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }
  return config;
}
