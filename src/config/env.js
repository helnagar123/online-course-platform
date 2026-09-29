import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 5000,

  mongodbUri: process.env.MONGODB_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',

    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  logLevel: process.env.LOG_LEVEL || 'info'
};

const requiredEnvironmentVariables = [
  ['MONGODB_URI', env.mongodbUri],
  ['JWT_ACCESS_SECRET', env.jwt.accessSecret],
  ['JWT_REFRESH_SECRET', env.jwt.refreshSecret]
];

const missingEnvironmentVariables = requiredEnvironmentVariables
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
  );
}

export default env;