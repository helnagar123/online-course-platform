import rateLimit from 'express-rate-limit';

import env from '../config/env.js';

const createRateLimiter = ({
  limit,
  message
}) => {
  return rateLimit({
    windowMs: env.rateLimit.windowMs,

    limit,

    standardHeaders: 'draft-8',

    legacyHeaders: false,

    handler: (req, res) => {
      return res.status(429).json({
        status: 'error',
        message
      });
    }
  });
};

const apiRateLimiter =
  createRateLimiter({
    limit: env.rateLimit.max,
    message:
      'Too many requests. Please try again later.'
  });

const authRateLimiter =
  createRateLimiter({
    limit: env.rateLimit.authMax,
    message:
      'Too many authentication attempts. Please try again later.'
  });

export {
  apiRateLimiter,
  authRateLimiter
};