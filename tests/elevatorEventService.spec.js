const elevatorEventService = require('../src/services/elevatorEventService')
const { ElevatorEvent, Elevator, Building } = require('../src/models')

describe('ElevatorEventService', () => {
  let testBuilding, testElevator

  // Setup before each test
  beforeEach(async () => {
    // Create test building
    testBuilding = await Building.create({
      name: 'Test Building',
      total_floors: 10,
      floor_travel_time_seconds: 5,
      door_operation_time_seconds: 2
    })

    // Create test elevator
    testElevator = await Elevator.create({
      building_id: testBuilding.id,
      name: 'Test Elevator A',
      current_floor: 0,
      state: 'idle',
      direction: 'stationary',
      door_state: 'closed'
    })
  })

  describe('createEvent', () => {
    it('should create a basic event with metadata', async () => {
      const event = await elevatorEventService.createEvent(
        testElevator.id,
        'test_event',
        5,
        { testData: 'test value' }
      )

      expect(event.id).toBeDefined()
      expect(event.elevator_id).toBe(testElevator.id)
      expect(event.event_type).toBe('test_event')
      expect(event.floor).toBe(5)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.testData).toBe('test value')
    })

    it('should throw error for invalid elevator ID', async () => {
      await expect(
        elevatorEventService.createEvent(
          99999, // Non-existent elevator ID
          'test_event',
          5,
          {}
        )
      ).rejects.toThrow()
    })
  })

  describe('handleCallReceived', () => {
    it('should create call received event with timing metadata', async () => {
      const callId = 123
      const fromFloor = 0
      const toFloor = 5

      await elevatorEventService.handleCallReceived(
        testElevator.id,
        callId,
        fromFloor,
        toFloor,
        testBuilding
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'call_received'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(fromFloor)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.callId).toBe(callId)
      expect(metadata.fromFloor).toBe(fromFloor)
      expect(metadata.toFloor).toBe(toFloor)
      expect(metadata.timing).toBeDefined()
      expect(metadata.timing.floorTravelTimePerFloor).toBe(5)
      expect(metadata.timing.doorOperationTime).toBe(2)
    })

    it('should handle missing building data gracefully', async () => {
      await elevatorEventService.handleCallReceived(
        testElevator.id,
        123,
        0,
        5,
        null // No building data
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'call_received'
        }
      })

      expect(event).not.toBeNull()

      const metadata = JSON.parse(event.metadata)
      expect(metadata.fromFloor).toBe(0)
      expect(metadata.toFloor).toBe(5)
      expect(metadata.timing).toBeUndefined() // No timing when building data is missing
    })
  })

  describe('handleElevatorAssigned', () => {
    it('should create elevator assigned event with pickup timing', async () => {
      const callId = 456
      const currentFloor = 3
      const pickupFloor = 0
      const destinationFloor = 8

      await elevatorEventService.handleElevatorAssigned(
        testElevator.id,
        callId,
        currentFloor,
        pickupFloor,
        destinationFloor,
        testBuilding
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'elevator_assigned'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(currentFloor)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.callId).toBe(callId)
      expect(metadata.currentFloor).toBe(currentFloor)
      expect(metadata.pickupFloor).toBe(pickupFloor)
      expect(metadata.destinationFloor).toBe(destinationFloor)

      // Check timing calculations
      expect(metadata.timing).toBeDefined()
      expect(metadata.timing.pickupDistance).toBe(3) // |3 - 0| = 3
      expect(metadata.timing.estimatedPickupTimeSeconds).toBe(15) // 3 floors * 5 seconds
      expect(metadata.timing.direction).toBe('down') // 0 < 3, so going down
    })

    it('should handle elevator already at pickup floor', async () => {
      const callId = 999
      const currentFloor = 5
      const pickupFloor = 5 // Same floor
      const destinationFloor = 8

      await elevatorEventService.handleElevatorAssigned(
        testElevator.id,
        callId,
        currentFloor,
        pickupFloor,
        destinationFloor,
        testBuilding
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'elevator_assigned'
        }
      })

      const metadata = JSON.parse(event.metadata)
      expect(metadata.timing.pickupDistance).toBe(0) // No distance to travel
      expect(metadata.timing.estimatedPickupTimeSeconds).toBe(0) // No time needed
    })
  })

  describe('handleMovementStarted', () => {
    it('should create movement started event with travel timing', async () => {
      const currentFloor = 2
      const targetFloor = 7
      const direction = 'up'

      await elevatorEventService.handleMovementStarted(
        testElevator.id,
        currentFloor,
        targetFloor,
        direction,
        testBuilding
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'movement_started'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(currentFloor)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.currentFloor).toBe(currentFloor)
      expect(metadata.targetFloor).toBe(targetFloor)
      expect(metadata.direction).toBe(direction)

      // Check timing calculations
      expect(metadata.timing).toBeDefined()
      expect(metadata.timing.distance).toBe(5) // |7 - 2| = 5
      expect(metadata.timing.estimatedTravelTimeSeconds).toBe(25) // 5 floors * 5 seconds
    })
  })

  describe('handleFloorReached', () => {
    it('should create floor reached event with travel analysis', async () => {
      const floor = 5
      const previousFloor = 2
      const actualTravelTime = 18

      await elevatorEventService.handleFloorReached(
        testElevator.id,
        floor,
        previousFloor,
        actualTravelTime
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'floor_reached'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(floor)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.previousFloor).toBe(previousFloor)
      expect(metadata.currentFloor).toBe(floor)
      expect(metadata.floorsTraversed).toBe(3) // |5 - 2| = 3

      // Check actual timing
      expect(metadata.timing).toBeDefined()
      expect(metadata.timing.actualTravelTimeSeconds).toBe(actualTravelTime)
      expect(metadata.timing.timePerFloor).toBe(6) // 18 seconds / 3 floors = 6 seconds per floor
    })
  })

  describe('handleDoorOperations', () => {
    it('should handle doors opening and opened events', async () => {
      const floor = 3
      const expectedDuration = 2
      const actualDuration = 2.5

      // Test doors opening
      await elevatorEventService.handleDoorsOpening(testElevator.id, floor, expectedDuration)

      let event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'doors_opening'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(floor)

      let metadata = JSON.parse(event.metadata)
      expect(metadata.timing.expectedDurationSeconds).toBe(expectedDuration)

      // Test doors opened
      await elevatorEventService.handleDoorsOpened(testElevator.id, floor, actualDuration)

      event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'doors_opened'
        }
      })

      expect(event).not.toBeNull()
      metadata = JSON.parse(event.metadata)
      expect(metadata.timing.actualOpenDurationSeconds).toBe(actualDuration)
    })

    it('should handle doors closing and closed events', async () => {
      const floor = 3
      const expectedDuration = 2
      const actualDuration = 1.8

      // Test doors closing
      await elevatorEventService.handleDoorsClosing(testElevator.id, floor, expectedDuration)

      let event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'doors_closing'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(floor)

      let metadata = JSON.parse(event.metadata)
      expect(metadata.timing.expectedDurationSeconds).toBe(expectedDuration)

      // Test doors closed
      await elevatorEventService.handleDoorsClosed(testElevator.id, floor, actualDuration)

      event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'doors_closed'
        }
      })

      expect(event).not.toBeNull()
      metadata = JSON.parse(event.metadata)
      expect(metadata.timing.actualCloseDurationSeconds).toBe(actualDuration)
    })
  })

  describe('handleCallCompleted', () => {
    it('should create call completed event with journey summary', async () => {
      const callId = 789
      const floor = 8
      const journeySummary = {
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T10:01:30Z',
        totalTimeSeconds: 90,
        efficiency: '95%'
      }

      await elevatorEventService.handleCallCompleted(
        testElevator.id,
        callId,
        floor,
        journeySummary
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'call_completed'
        }
      })

      expect(event).not.toBeNull()
      expect(event.floor).toBe(floor)

      const metadata = JSON.parse(event.metadata)
      expect(metadata.callId).toBe(callId)
      expect(metadata.completedAtFloor).toBe(floor)
      expect(metadata.journey).toEqual(journeySummary)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle events without timing data', async () => {
      await elevatorEventService.handleMovementStarted(
        testElevator.id,
        2,
        7,
        'up',
        null // No building data
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'movement_started'
        }
      })

      expect(event).not.toBeNull()
      const metadata = JSON.parse(event.metadata)
      expect(metadata.timing).toBeUndefined()
    })

    it('should handle zero distance calculations', async () => {
      await elevatorEventService.handleFloorReached(
        testElevator.id,
        5,
        5, // Same floor (shouldn't happen but test edge case)
        0
      )

      const event = await ElevatorEvent.findOne({
        where: { 
          elevator_id: testElevator.id,
          event_type: 'floor_reached'
        }
      })

      const metadata = JSON.parse(event.metadata)
      expect(metadata.floorsTraversed).toBe(0)
    })
  })
})