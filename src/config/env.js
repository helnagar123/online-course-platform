import 'dotenv/config';

const nodeEnv =
  process.env.NODE_ENV || 'development';

const port = Number(
  process.env.PORT || 5000
);

const mongodbUri =
  process.env.MONGODB_URI;

const jwtAccessSecret =
  process.env.JWT_ACCESS_SECRET;

const jwtAccessExpiresIn =
  process.env.JWT_ACCESS_EXPIRES_IN || '15m';

const jwtRefreshExpiresIn =
  process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const rateLimitWindowMs =
  Number(
    process.env.RATE_LIMIT_WINDOW_MS
  ) || 15 * 60 * 1000;

const rateLimitMax =
  Number(
    process.env.RATE_LIMIT_MAX
  ) || 100;

const authRateLimitMax =
  Number(
    process.env.AUTH_RATE_LIMIT_MAX
  ) || 10;

const logLevel =
  process.env.LOG_LEVEL || 'info';

if (
  !['development', 'test', 'production'].includes(
    nodeEnv
  )
) {
  throw new Error(
    `Invalid NODE_ENV: ${nodeEnv}`
  );
}

if (!mongodbUri) {
  throw new Error(
    'MONGODB_URI is required'
  );
}

if (!jwtAccessSecret) {
  throw new Error(
    'JWT_ACCESS_SECRET is required'
  );
}

if (
  nodeEnv === 'production' &&
  jwtAccessSecret.length < 32
) {
  throw new Error(
    'JWT_ACCESS_SECRET must be at least 32 characters in production'
  );
}

if (
  !Number.isInteger(port) ||
  port <= 0 ||
  port > 65535
) {
  throw new Error(
    'PORT must be a valid number between 1 and 65535'
  );
}

if (
  !Number.isFinite(rateLimitWindowMs) ||
  rateLimitWindowMs <= 0
) {
  throw new Error(
    'RATE_LIMIT_WINDOW_MS must be a positive number'
  );
}

if (
  !Number.isInteger(rateLimitMax) ||
  rateLimitMax <= 0
) {
  throw new Error(
    'RATE_LIMIT_MAX must be a positive integer'
  );
}

if (
  !Number.isInteger(authRateLimitMax) ||
  authRateLimitMax <= 0
) {
  throw new Error(
    'AUTH_RATE_LIMIT_MAX must be a positive integer'
  );
}

const env = {
  nodeEnv,

  port,

  mongodbUri,

  jwt: {
    accessSecret: jwtAccessSecret,
    accessExpiresIn: jwtAccessExpiresIn,
    refreshExpiresIn: jwtRefreshExpiresIn
  },

  cors: {
    origins: corsOrigins
  },

  rateLimit: {
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    authMax: authRateLimitMax
  },

  logLevel
};

export default env;