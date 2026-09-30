import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import logger from './config/logger.js';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import notFoundMiddleware from './middleware/notFound.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import {
  apiRateLimiter
} from './middleware/rateLimiter.middleware.js';

const app = express();

app.disable(
  'x-powered-by'
);

app.use(
  helmet()
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        env.cors.origins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          'Origin not allowed by CORS'
        )
      );
    }
  })
);

app.use(
  pinoHttp({
    logger
  })
);

app.use(
  express.json({
    limit: '100kb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '100kb'
  })
);

app.get(
  '/health',
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message:
        'Online Course Platform API is running'
    });
  }
);

app.use(
  '/api/v1',
  apiRateLimiter,
  apiRoutes
);

app.use(
  notFoundMiddleware
);

app.use(
  errorMiddleware
);

export default app;