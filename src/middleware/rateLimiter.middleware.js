import rateLimit from 'express-rate-limit';

import env from '../config/env.js';

const apiRateLimiter =
  rateLimit({
    windowMs:
      env.rateLimit.windowMs,

    limit:
      env.rateLimit.max,

    standardHeaders: 'draft-8',

    legacyHeaders: false,

    message: {
      status: 'error',
      message:
        'Too many requests. Please try again later.'
    }
  });

const authRateLimiter =
  rateLimit({
    windowMs:
      env.rateLimit.windowMs,

    limit:
      env.rateLimit.authMax,

    standardHeaders: 'draft-8',

    legacyHeaders: false,

    message: {
      status: 'error',
      message:
        'Too many authentication attempts. Please try again later.'
    }
  });

export {
  apiRateLimiter,
  authRateLimiter
};