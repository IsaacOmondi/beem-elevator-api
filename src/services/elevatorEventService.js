const { ElevatorEvent, Elevator, Building } = require('../models');
const logger = require('../config/logger');

class ElevatorEventService {
  
  // Create an event and log it
  async createEvent(elevatorId, eventType, floor = null, metadata = {}) {
    try {
      const event = await ElevatorEvent.create({
        elevator_id: elevatorId,
        event_type: eventType,
        floor: floor,
        metadata: JSON.stringify(metadata)
      });
      
      logger.info('Elevator event created', {
        eventId: event.id,
        elevatorId,
        eventType,
        floor,
        metadata
      });
      
      return event;
    } catch (error) {
      logger.error('Failed to create elevator event', {
        elevatorId,
        eventType,
        floor,
        error: error.message
      });
      throw error;
    }
  }
  
  // Handle call received - with timing calculations
  async handleCallReceived(elevatorId, callId, fromFloor, toFloor, building = null) {
    const metadata = {
      callId,
      fromFloor,
      toFloor,
      timestamp: new Date().toISOString()
    };
    
    // Add timing information if building data is available
    if (building) {
      const journeyDistance = Math.abs(toFloor - fromFloor);
      const estimatedJourneyTime = journeyDistance * building.floor_travel_time_seconds;
      const estimatedDoorOperations = 4; // Open/close at pickup and destination
      const estimatedDoorTime = estimatedDoorOperations * building.door_operation_time_seconds;
      
      metadata.timing = {
        estimatedJourneyTimeSeconds: estimatedJourneyTime,
        estimatedDoorTimeSeconds: estimatedDoorTime,
        estimatedTotalTimeSeconds: estimatedJourneyTime + estimatedDoorTime + 6, // +6 for boarding
        floorTravelTimePerFloor: building.floor_travel_time_seconds,
        doorOperationTime: building.door_operation_time_seconds
      };
    }
    
    await this.createEvent(elevatorId, 'call_received', fromFloor, metadata);
  }
  
  // Handle elevator assignment - with pickup timing
  async handleElevatorAssigned(elevatorId, callId, currentFloor, pickupFloor, destinationFloor, building = null) {
    const metadata = {
      callId,
      currentFloor,
      pickupFloor,
      destinationFloor,
      timestamp: new Date().toISOString()
    };
    
    // Add pickup timing if building data is available
    if (building) {
      const pickupDistance = Math.abs(pickupFloor - currentFloor);
      const estimatedPickupTime = pickupDistance * building.floor_travel_time_seconds;
      
      metadata.timing = {
        pickupDistance,
        estimatedPickupTimeSeconds: estimatedPickupTime,
        direction: pickupFloor > currentFloor ? 'up' : 'down'
      };
    }
    
    await this.createEvent(elevatorId, 'elevator_assigned', currentFloor, metadata);
  }
  
  // Handle movement start - with destination timing
  async handleMovementStarted(elevatorId, currentFloor, targetFloor, direction, building = null) {
    const metadata = {
      currentFloor,
      targetFloor,
      direction,
      timestamp: new Date().toISOString()
    };
    
    // Add movement timing if building data is available
    if (building) {
      const distance = Math.abs(targetFloor - currentFloor);
      const estimatedTravelTime = distance * building.floor_travel_time_seconds;
      
      metadata.timing = {
        distance,
        estimatedTravelTimeSeconds: estimatedTravelTime,
        floorTravelTimePerFloor: building.floor_travel_time_seconds
      };
    }
    
    await this.createEvent(elevatorId, 'movement_started', currentFloor, metadata);
  }
  
  // Handle floor reached
  async handleFloorReached(elevatorId, floor, previousFloor, actualTravelTime = null) {
    const metadata = {
      previousFloor,
      currentFloor: floor,
      floorsTraversed: Math.abs(floor - previousFloor),
      timestamp: new Date().toISOString()
    };
    
    // Add actual travel time if provided
    if (actualTravelTime) {
      metadata.timing = {
        actualTravelTimeSeconds: actualTravelTime,
        timePerFloor: actualTravelTime / Math.abs(floor - previousFloor)
      };
    }
    
    await this.createEvent(elevatorId, 'floor_reached', floor, metadata);
  }
  
  // Handle door operations with timing
  async handleDoorsOpening(elevatorId, floor, expectedDuration = null) {
    const metadata = {
      floor,
      timestamp: new Date().toISOString()
    };
    
    if (expectedDuration) {
      metadata.timing = {
        expectedDurationSeconds: expectedDuration
      };
    }
    
    await this.createEvent(elevatorId, 'doors_opening', floor, metadata);
  }
  
  async handleDoorsOpened(elevatorId, floor, actualDuration = null) {
    const metadata = {
      floor,
      timestamp: new Date().toISOString()
    };
    
    if (actualDuration) {
      metadata.timing = {
        actualOpenDurationSeconds: actualDuration
      };
    }
    
    await this.createEvent(elevatorId, 'doors_opened', floor, metadata);
  }
  
  async handleDoorsClosing(elevatorId, floor, expectedDuration = null) {
    const metadata = {
      floor,
      timestamp: new Date().toISOString()
    };
    
    if (expectedDuration) {
      metadata.timing = {
        expectedDurationSeconds: expectedDuration
      };
    }
    
    await this.createEvent(elevatorId, 'doors_closing', floor, metadata);
  }
  
  async handleDoorsClosed(elevatorId, floor, actualDuration = null) {
    const metadata = {
      floor,
      timestamp: new Date().toISOString()
    };
    
    if (actualDuration) {
      metadata.timing = {
        actualCloseDurationSeconds: actualDuration
      };
    }
    
    await this.createEvent(elevatorId, 'doors_closed', floor, metadata);
  }
  
  // Handle call completion with journey summary
  async handleCallCompleted(elevatorId, callId, floor, journeySummary = null) {
    const metadata = {
      callId,
      completedAtFloor: floor,
      timestamp: new Date().toISOString()
    };
    
    // Add journey summary if provided
    if (journeySummary) {
      metadata.journey = journeySummary;
    }
    
    await this.createEvent(elevatorId, 'call_completed', floor, metadata);
  }
}

module.exports = new ElevatorEventService();