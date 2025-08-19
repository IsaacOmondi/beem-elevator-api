// src/middleware/errorHandler.js
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error with request context
  logger.error('Unhandled error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  });
  
  // Handle different types of errors
  let status = 500;
  let errorResponse = {
    error: 'internal_server_error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  };
  
  // Validation errors (from express-validator or custom validation)
  if (err.name === 'ValidationError' || err.status === 400) {
    status = 400;
    errorResponse = {
      error: 'validation_error',
      message: err.message || 'Invalid request data',
      details: err.details || err.errors || undefined,
      timestamp: new Date().toISOString()
    };
  }
  
  // Sequelize validation errors
  else if (err.name === 'SequelizeValidationError') {
    status = 400;
    errorResponse = {
      error: 'validation_error',
      message: 'Invalid data provided',
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      })),
      timestamp: new Date().toISOString()
    };
  }
  
  // Sequelize foreign key constraint errors
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    errorResponse = {
      error: 'reference_error',
      message: 'Referenced resource does not exist',
      field: err.fields?.[0] || 'unknown',
      timestamp: new Date().toISOString()
    };
  }
  
  // Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    errorResponse = {
      error: 'conflict_error',
      message: 'Resource already exists',
      field: err.errors?.[0]?.path || 'unknown',
      timestamp: new Date().toISOString()
    };
  }
  
  // Not found errors
  else if (err.status === 404 || err.name === 'NotFoundError') {
    status = 404;
    errorResponse = {
      error: 'not_found',
      message: err.message || 'Resource not found',
      timestamp: new Date().toISOString()
    };
  }
  
  // Unauthorized errors
  else if (err.status === 401 || err.name === 'UnauthorizedError') {
    status = 401;
    errorResponse = {
      error: 'unauthorized',
      message: 'Authentication required',
      timestamp: new Date().toISOString()
    };
  }
  
  // Forbidden errors
  else if (err.status === 403 || err.name === 'ForbiddenError') {
    status = 403;
    errorResponse = {
      error: 'forbidden',
      message: 'Access denied',
      timestamp: new Date().toISOString()
    };
  }
  
  // Database connection errors
  else if (err.name === 'SequelizeConnectionError') {
    status = 503;
    errorResponse = {
      error: 'service_unavailable',
      message: 'Database temporarily unavailable',
      timestamp: new Date().toISOString()
    };
  }
  
  // In development, include more error details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = errorResponse.details || err.details;
  }
  
  // Send error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;