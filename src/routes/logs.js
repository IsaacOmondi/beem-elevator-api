// src/routes/logs.js
const express = require('express');
const router = express.Router();

const { ElevatorEvent, SqlQueryLog, Elevator } = require('../models');

// Import validations
const {
  handleValidationErrors,
  logEventsQueryValidation,
  sqlQueryValidation
} = require('../middleware/validation');

// GET /api/logs/events
router.get('/events',
  logEventsQueryValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        elevatorId,
        buildingId,
        startTime,
        endTime,
        eventType,
        floor,
        limit = 100,
        offset = 0
      } = req.query;
      
      // Build where clause
      const whereClause = {};
      
      if (elevatorId) {
        whereClause.elevator_id = elevatorId;
      }
      
      if (eventType) {
        whereClause.event_type = eventType;
      }
      
      if (floor) {
        whereClause.floor = floor;
      }
      
      if (startTime || endTime) {
        whereClause.created_at = {};
        if (startTime) {
          whereClause.created_at[require('sequelize').Op.gte] = new Date(startTime);
        }
        if (endTime) {
          whereClause.created_at[require('sequelize').Op.lte] = new Date(endTime);
        }
      }
      
      // Include building filter if specified
      const includeClause = [];
      if (buildingId) {
        includeClause.push({
          model: Elevator,
          where: { building_id: buildingId },
          attributes: []
        });
      }
      
      const events = await ElevatorEvent.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      const totalCount = await ElevatorEvent.count({
        where: whereClause,
        include: includeClause
      });
      
      res.json({
        events: events.map(event => ({
          eventId: event.id,
          elevatorId: event.elevator_id,
          eventType: event.event_type,
          floor: event.floor,
          metadata: JSON.parse(event.metadata),
          timestamp: event.created_at
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        },
        filters: {
          elevatorId,
          buildingId,
          startTime,
          endTime,
          eventType,
          floor
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/logs/sql-queries
router.get('/sql-queries',
  sqlQueryValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        startTime,
        endTime,
        limit = 100,
        offset = 0
      } = req.query;
      
      // Build where clause
      const whereClause = {};
      
      if (startTime || endTime) {
        whereClause.created_at = {};
        if (startTime) {
          whereClause.created_at[require('sequelize').Op.gte] = new Date(startTime);
        }
        if (endTime) {
          whereClause.created_at[require('sequelize').Op.lte] = new Date(endTime);
        }
      }
      
      const queries = await SqlQueryLog.findAll({
        attributes: ['id','sql_query', 'request_path', 'created_at'],
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      const totalCount = await SqlQueryLog.count({
        where: whereClause
      });
      
      res.json({
        queries: queries.map(query => ({
          id: query.id,
          sqlQuery: query.sql_query,
          requestPath: query.request_path,
          timestamp: query.created_at
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        },
        filters: {
          startTime,
          endTime
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;