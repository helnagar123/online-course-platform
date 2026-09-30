import mongoose from 'mongoose';

import AppError from '../utils/AppError.js';

import logger from '../config/logger.js';

const getDuplicateKeyDetails = (error) => {
  const details = {};

  if (error.keyValue) {
    for (const [field, value] of Object.entries(
      error.keyValue
    )) {
      details[field] = {
        value,
        message: `${field} already exists`
      };
    }
  }

  return details;
};

const getValidationDetails = (error) => {
  const details = {};

  for (const [
    field,
    validationError
  ] of Object.entries(error.errors)) {
    details[field] = {
      message: validationError.message
    };
  }

  return details;
};

const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (
    error instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;
    message = 'Database validation failed';
    details =
      getValidationDetails(error);
  } else if (
    error instanceof mongoose.Error.CastError
  ) {
    statusCode = 400;
    message = `Invalid value for field: ${error.path}`;
  } else if (error?.code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
    details =
      getDuplicateKeyDetails(error);
  } else if (
    error instanceof SyntaxError &&
    error.type === 'entity.parse.failed'
  ) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  } else if (
    error?.name === 'TokenExpiredError' ||
    error?.name === 'JsonWebTokenError'
  ) {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  const errorResponse = {
    status: 'error',
    message
  };

  if (details) {
    errorResponse.errors = details;
  }

  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    errorResponse.stack = error.stack;
  }

  if (statusCode >= 500) {
    logger.error(
      {
        err: error,
        method: req.method,
        url: req.originalUrl
      },
      'Unhandled application error'
    );
  } else {
    logger.warn(
      {
        statusCode,
        method: req.method,
        url: req.originalUrl,
        message
      },
      'Request failed'
    );
  }

  return res
    .status(statusCode)
    .json(errorResponse);
};

export default errorMiddleware;