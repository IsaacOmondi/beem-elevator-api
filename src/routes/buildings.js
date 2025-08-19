// src/routes/buildings.js
const express = require('express');
const router = express.Router();

const { Building, Elevator, ElevatorCall, ElevatorEvent, ElevatorQueue } = require('../models');
const logger = require('../config/logger');

const { body } = require('express-validator');


// Import validations
const {
  handleValidationErrors,
  buildingIdValidation,
  elevatorIdValidation,
  callElevatorValidation,
  statusQueryValidation,
  eventsQueryValidation
} = require('../middleware/validation');

const elevatorEventService = require('../services/elevatorEventService');

// GET /api/buildings/:buildingId/info
router.get('/:buildingId/info', 
  buildingIdValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId } = req.params;
      
      const building = await Building.findByPk(buildingId, {
        include: [{
          model: Elevator,
          as: 'elevators',
          attributes: ['id', 'name', 'current_floor', 'state']
        }]
      });
      
      if (!building) {
        return res.status(404).json({
          error: 'not_found',
          message: `Building ${buildingId} not found`,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        buildingId: building.id,
        name: building.name,
        totalFloors: building.total_floors,
        elevatorCount: building.elevators?.length || 0,
        floorTravelTime: building.floor_travel_time_seconds,
        doorOperationTime: building.door_operation_time_seconds,
        elevators: building.elevators?.map(elevator => ({
          id: elevator.id,
          name: elevator.name,
          currentFloor: elevator.current_floor,
          state: elevator.state
        })) || []
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/buildings/:buildingId/elevators/status
router.get('/:buildingId/elevators/status',
  buildingIdValidation,
  statusQueryValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId } = req.params;
      const { since, elevatorId } = req.query;
      
      // Verify building exists
      const building = await Building.findByPk(buildingId);
      if (!building) {
        return res.status(404).json({
          error: 'not_found',
          message: `Building ${buildingId} not found`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Build where clause
      const whereClause = { building_id: buildingId };
      if (elevatorId) {
        whereClause.id = elevatorId;
      }
      if (since) {
        whereClause.updated_at = {
          [require('sequelize').Op.gt]: new Date(since)
        };
      }
      
      const elevators = await Elevator.findAll({
        where: whereClause,
        include: [
        {
          model: ElevatorQueue,
          as: 'elevator_queue',
          include: [{
            model: ElevatorCall,
            as: 'call'
          }],
          order: [['priority', 'ASC'], ['created_at', 'ASC']]
        },
        {
            model: Building,
            as: 'building',
            attributes: ['name']
          },
        ],
        order: [['id', 'ASC']]
      });
      
      // If since parameter provided and no updates, return 304
      if (since && elevators.length === 0) {
        return res.status(304).send();
      }
      
      const elevatorData = elevators.map(elevator => ({
        elevatorId: elevator.id,
        buildingName: elevator.building?.name || 'Unknown Building',
        name: elevator.name,
        currentFloor: elevator.current_floor,
        targetFloor: elevator.target_floor,
        state: elevator.state,
        direction: elevator.direction,
        doorState: elevator.door_state,
        queue: elevator.queue?.map(item => ({
          floor: item.floor,
          type: item.queue_type,
          callId: item.call_id,
          priority: item.priority
        })) || [],
        lastUpdated: elevator.updated_at
      }));
      
      res.json({
        elevators: elevatorData,
        timestamp: new Date().toISOString(),
        hasUpdates: true
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/buildings/:buildingId/elevators/:elevatorId/status
router.get('/:buildingId/elevators/:elevatorId/status',
  buildingIdValidation,
  elevatorIdValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId, elevatorId } = req.params;
      
      const elevator = await Elevator.findOne({
        where: { id: elevatorId, building_id: buildingId },
        include: [
        {
            model: ElevatorQueue,
            as: 'elevator_queue',
            include: [{
            model: ElevatorCall,
            as: 'call'
            }],
            order: [['priority', 'ASC'], ['created_at', 'ASC']]
        },
        {
            model: Building,
            as: 'building',
            attributes: ['name']
        }
    ]
      });
      
      if (!elevator) {
        return res.status(404).json({
          error: 'not_found',
          message: `Elevator ${elevatorId} not found in building ${buildingId}`,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        elevatorId: elevator.id,
        buildingName: elevator.building?.name || 'Unknown Building',
        name: elevator.name,
        currentFloor: elevator.current_floor,
        targetFloor: elevator.target_floor,
        state: elevator.state,
        direction: elevator.direction,
        doorState: elevator.door_state,
        queue: elevator.elevator_queue?.map(item => ({
          floor: item.floor,
          type: item.queue_type,
          callId: item.call_id,
          priority: item.priority
        })) || [],
        lastUpdated: elevator.updated_at
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/buildings/:buildingId/elevators/:elevatorId/events
router.get('/:buildingId/elevators/:elevatorId/events',
  buildingIdValidation,
  elevatorIdValidation,
  eventsQueryValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId, elevatorId } = req.params;
      const { since, limit = 50, offset = 0 } = req.query;
      
      // Verify elevator exists in building
      const elevator = await Elevator.findOne({
        where: { id: elevatorId, building_id: buildingId }
      });
      
      if (!elevator) {
        return res.status(404).json({
          error: 'not_found',
          message: `Elevator ${elevatorId} not found in building ${buildingId}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Build where clause
      const whereClause = { elevator_id: elevatorId };
      if (since) {
        whereClause.created_at = {
          [require('sequelize').Op.gt]: new Date(since)
        };
      }
      
      const events = await ElevatorEvent.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      const totalCount = await ElevatorEvent.count({
        where: whereClause
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
        lastEventTimestamp: events.length > 0 ? events[0].created_at : null,
        total: totalCount,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/buildings/:buildingId/elevators/call
router.post('/:buildingId/elevators/call',
  buildingIdValidation,
  callElevatorValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId } = req.params;
      const { fromFloor, toFloor, elevatorId } = req.body;
      
      // Verify building exists and get floor limits
      const building = await Building.findByPk(buildingId);
      if (!building) {
        return res.status(404).json({
          error: 'not_found',
          message: `Building ${buildingId} not found`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Validate floor ranges (0-based: 0 = ground floor, 1 = first floor, etc.)
      if (fromFloor < 0 || fromFloor >= building.total_floors) {
        return res.status(400).json({
          error: 'invalid_floor',
          message: `From floor ${fromFloor} is invalid. Building has floors 0-${building.total_floors - 1} (0 = ground floor)`,
          buildingFloorRange: `0-${building.total_floors - 1}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (toFloor < 0 || toFloor >= building.total_floors) {
        return res.status(400).json({
          error: 'invalid_floor',
          message: `To floor ${toFloor} is invalid. Building has floors 0-${building.total_floors - 1} (0 = ground floor)`,
          buildingFloorRange: `0-${building.total_floors - 1}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (fromFloor === toFloor) {
        return res.status(400).json({
          error: 'invalid_request',
          message: 'From floor and to floor cannot be the same',
          timestamp: new Date().toISOString()
        });
      }
      
      // Find available elevator (simplified logic for now)
      let assignedElevator;
      if (elevatorId) {
        // Use specific elevator if requested
        assignedElevator = await Elevator.findOne({
          where: { id: elevatorId, building_id: buildingId }
        });
        
        if (!assignedElevator) {
          return res.status(404).json({
            error: 'not_found',
            message: `Elevator ${elevatorId} not found in building ${buildingId}`,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Find best available elevator (simple: idle elevator closest to fromFloor)
        assignedElevator = await Elevator.findOne({
          where: { 
            building_id: buildingId,
            state: 'idle'
          },
          order: [
            [require('sequelize').literal(`ABS(current_floor - ${fromFloor})`), 'ASC']
          ]
        });
        
        if (!assignedElevator) {
          // If no idle elevator, assign to any elevator (real system would have smarter logic)
          assignedElevator = await Elevator.findOne({
            where: { building_id: buildingId },
            order: [
              [require('sequelize').literal(`ABS(current_floor - ${fromFloor})`), 'ASC']
            ]
          });
        }
      }
      
      if (!assignedElevator) {
        return res.status(503).json({
          error: 'service_unavailable',
          message: 'No elevators available in this building',
          timestamp: new Date().toISOString()
        });
      }
      
      // Create elevator call record
      const elevatorCall = await ElevatorCall.create({
        building_id: buildingId,
        elevator_id: assignedElevator.id,
        from_floor: fromFloor,
        to_floor: toFloor,
        status: 'assigned'
      });

      // CREATE EVENTS with timing metadata
      await elevatorEventService.handleCallReceived(
        assignedElevator.id, 
        elevatorCall.id, 
        fromFloor, 
        toFloor,
        building // Pass building for timing info
      );
      
      await elevatorEventService.handleElevatorAssigned(
        assignedElevator.id,
        elevatorCall.id,
        assignedElevator.current_floor,
        fromFloor,
        toFloor,
        building // Pass building for timing info
      );
      
      // Calculate estimated journey time and log it
      const pickupDistance = Math.abs(assignedElevator.current_floor - fromFloor);
      const journeyDistance = Math.abs(toFloor - fromFloor);
      const totalTravelTime = (pickupDistance + journeyDistance) * building.floor_travel_time_seconds;
      const totalDoorOperations = 4; // Open/close at pickup and destination
      const totalDoorTime = totalDoorOperations * building.door_operation_time_seconds;
      const estimatedTotalTime = totalTravelTime + totalDoorTime + 6; // +6 for passenger boarding time
      
      await elevatorEventService.createEvent(
        assignedElevator.id,
        'journey_planned',
        fromFloor,
        {
          callId: elevatorCall.id,
          estimatedTotalTimeSeconds: estimatedTotalTime,
          estimatedPickupTimeSeconds: pickupDistance * building.floor_travel_time_seconds + building.door_operation_time_seconds * 2,
          pickupDistance,
          journeyDistance,
          phases: [
            {
              phase: 'pickup',
              fromFloor: assignedElevator.current_floor,
              toFloor: fromFloor,
              estimatedTimeSeconds: pickupDistance * building.floor_travel_time_seconds
            },
            {
              phase: 'journey',
              fromFloor: fromFloor,
              toFloor: toFloor,
              estimatedTimeSeconds: journeyDistance * building.floor_travel_time_seconds
            }
          ]
        }
      );
      
      // Calculate estimated arrival time (simplified)
      const floorsToTravel = Math.abs(assignedElevator.current_floor - fromFloor);
      const estimatedSeconds = floorsToTravel * building.floor_travel_time_seconds;
      const estimatedArrivalTime = new Date(Date.now() + (estimatedSeconds * 1000));
      
      logger.info('Elevator call created', {
        callId: elevatorCall.id,
        buildingId,
        elevatorId: assignedElevator.id,
        fromFloor,
        toFloor,
        estimatedArrivalTime
      });
      
      res.status(201).json({
        callId: elevatorCall.id,
        buildingId: parseInt(buildingId),
        assignedElevatorId: assignedElevator.id,
        estimatedArrivalTime: estimatedArrivalTime.toISOString(),
        status: 'assigned',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:buildingId/elevators/:elevatorId/complete-trip',
  buildingIdValidation,
  elevatorIdValidation,
  [
    body('callId').optional().isInt({ min: 1 }).withMessage('Call ID must be a positive integer'),
    body('completedAtFloor').isInt({ min: 0 }).withMessage('Completed at floor must be 0 or higher'),
    body('actualJourneyTime').optional().isInt({ min: 0 }).withMessage('Actual journey time must be non-negative'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId, elevatorId } = req.params;
      const { callId, completedAtFloor, actualJourneyTime, notes } = req.body;
      
      // Verify elevator exists in building
      const elevator = await Elevator.findOne({
        where: { id: elevatorId, building_id: buildingId },
        include: [{
          model: Building,
          as: 'building'
        }]
      });
      
      if (!elevator) {
        return res.status(404).json({
          error: 'not_found',
          message: `Elevator ${elevatorId} not found in building ${buildingId}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Validate completed floor is within building limits
      if (completedAtFloor >= elevator.building.total_floors) {
        return res.status(400).json({
          error: 'invalid_floor',
          message: `Completed floor ${completedAtFloor} is invalid. Building has floors 0-${elevator.building.total_floors - 1}`,
          buildingFloorRange: `0-${elevator.building.total_floors - 1}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Find active call to complete (if callId provided, use it; otherwise find active call)
      let elevatorCall = null;
      if (callId) {
        elevatorCall = await ElevatorCall.findOne({
          where: { 
            id: callId, 
            elevator_id: elevatorId,
            status: 'assigned'
          }
        });
        
        if (!elevatorCall) {
          return res.status(404).json({
            error: 'not_found',
            message: `Active call ${callId} not found for elevator ${elevatorId}`,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Find any active call for this elevator
        elevatorCall = await ElevatorCall.findOne({
          where: { 
            elevator_id: elevatorId,
            status: 'assigned'
          },
          order: [['created_at', 'ASC']] // Complete oldest call first
        });
      }
      
      // Create journey summary
      const journeySummary = {
        startTime: elevatorCall?.created_at || null,
        endTime: new Date().toISOString(),
        fromFloor: elevatorCall?.from_floor || null,
        toFloor: elevatorCall?.to_floor || null,
        completedAtFloor,
        actualJourneyTimeSeconds: actualJourneyTime || null,
        notes: notes || null
      };
      
      // If we calculated actual journey time, add timing analysis
      if (actualJourneyTime && elevatorCall) {
        const plannedDistance = Math.abs(elevatorCall.to_floor - elevatorCall.from_floor);
        const estimatedTime = plannedDistance * elevator.building.floor_travel_time_seconds;
        
        journeySummary.performance = {
          plannedDistance,
          estimatedTimeSeconds: estimatedTime,
          actualTimeSeconds: actualJourneyTime,
          efficiency: estimatedTime > 0 ? (estimatedTime / actualJourneyTime * 100).toFixed(1) + '%' : 'N/A',
          variance: estimatedTime > 0 ? actualJourneyTime - estimatedTime : null
        };
      }
      
      // Update elevator to completed state
      await elevator.update({
        current_floor: completedAtFloor,
        target_floor: null,
        state: 'idle',
        direction: 'stationary',
        door_state: 'closed'
      });
      
      // Complete the call if found
      if (elevatorCall) {
        await elevatorCall.update({
          status: 'completed',
          completed_at: new Date()
        });
        
        // Remove any queue items for this call
        await ElevatorQueue.destroy({
          where: { call_id: elevatorCall.id }
        });
      }
      
      // Create completion event
      await elevatorEventService.handleCallCompleted(
        elevatorId,
        elevatorCall?.id || null,
        completedAtFloor,
        journeySummary
      );
      
      // Create additional events for trip completion
      await elevatorEventService.createEvent(
        elevatorId,
        'trip_completed_manually',
        completedAtFloor,
        {
          callId: elevatorCall?.id || null,
          completedBy: 'api_call',
          journeySummary,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info('Elevator trip completed manually', {
        elevatorId,
        callId: elevatorCall?.id,
        completedAtFloor,
        actualJourneyTime,
        notes
      });
      
      res.json({
        success: true,
        message: 'Trip completed successfully',
        elevatorId: parseInt(elevatorId),
        buildingId: parseInt(buildingId),
        completedCall: elevatorCall ? {
          callId: elevatorCall.id,
          fromFloor: elevatorCall.from_floor,
          toFloor: elevatorCall.to_floor,
          status: 'completed'
        } : null,
        elevatorStatus: {
          currentFloor: completedAtFloor,
          state: 'idle',
          direction: 'stationary',
          doorState: 'closed'
        },
        journeySummary,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:buildingId/elevators/:elevatorId/active-calls',
  buildingIdValidation,
  elevatorIdValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { buildingId, elevatorId } = req.params;
      
      // Verify elevator exists
      const elevator = await Elevator.findOne({
        where: { id: elevatorId, building_id: buildingId }
      });
      
      if (!elevator) {
        return res.status(404).json({
          error: 'not_found',
          message: `Elevator ${elevatorId} not found in building ${buildingId}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Get active calls
      const activeCalls = await ElevatorCall.findAll({
        where: { 
          elevator_id: elevatorId,
          status: 'assigned'
        },
        order: [['created_at', 'ASC']]
      });
      
      res.json({
        elevatorId: parseInt(elevatorId),
        buildingId: parseInt(buildingId),
        activeCalls: activeCalls.map(call => ({
          callId: call.id,
          fromFloor: call.from_floor,
          toFloor: call.to_floor,
          status: call.status,
          createdAt: call.created_at,
          estimatedDuration: Math.abs(call.to_floor - call.from_floor) * 5 // 5 seconds per floor
        })),
        totalActiveCalls: activeCalls.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;