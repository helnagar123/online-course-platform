import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import logger from './config/logger.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  pinoHttp({
    logger
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Online Course Platform API is running'
  });
});

export default app;