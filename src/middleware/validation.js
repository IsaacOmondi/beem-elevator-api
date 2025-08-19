// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Invalid request data',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Common validations
const buildingIdValidation = param('buildingId')
  .isInt({ min: 1 })
  .withMessage('Building ID must be a positive integer');

const elevatorIdValidation = param('elevatorId')
  .isInt({ min: 1 })
  .withMessage('Elevator ID must be a positive integer');

// Building-specific validations
const callElevatorValidation = [
  body('fromFloor')
    .isInt({ min: 0 })
    .withMessage('From floor must be 0 or higher (0 = ground floor)'),
  body('toFloor')
    .isInt({ min: 0 })
    .withMessage('To floor must be 0 or higher (0 = ground floor)'),
  body('elevatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Elevator ID must be a positive integer')
];

const statusQueryValidation = [
  query('since')
    .optional()
    .isISO8601()
    .withMessage('Since must be a valid ISO 8601 timestamp'),
  query('elevatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Elevator ID must be a positive integer')
];

const eventsQueryValidation = [
  query('since')
    .optional()
    .isISO8601()
    .withMessage('Since must be a valid ISO 8601 timestamp'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

// Log-specific validations
const logEventsQueryValidation = [
  query('elevatorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Elevator ID must be a positive integer'),
  query('buildingId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Building ID must be a positive integer'),
  query('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 timestamp'),
  query('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 timestamp'),
  query('eventType')
    .optional()
    .isString()
    .withMessage('Event type must be a string'),
  query('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be 0 or higher (0 = ground floor)'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

const sqlQueryValidation = [
  query('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 timestamp'),
  query('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 timestamp'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

module.exports = {
  handleValidationErrors,
  buildingIdValidation,
  elevatorIdValidation,
  callElevatorValidation,
  statusQueryValidation,
  eventsQueryValidation,
  logEventsQueryValidation,
  sqlQueryValidation
};