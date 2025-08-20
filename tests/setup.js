// tests/setup.js (disable FK checks version)
require('dotenv').config()
process.env.NODE_ENV = 'test'

const db = require('../src/models')

beforeAll(async () => {
  try {
    console.log('Setting up test database...')
    await db.sequelize.authenticate()
    console.log('Database connection successful')
    
    // For PostgreSQL, disable foreign key checks temporarily
    await db.sequelize.query('SET session_replication_role = replica;')
    console.log('Foreign key checks disabled')
    
    // Drop and recreate all tables
    await db.sequelize.sync({ force: true })
    console.log('Database sync completed')
    
    // Re-enable foreign key checks
    await db.sequelize.query('SET session_replication_role = DEFAULT;')
    console.log('Foreign key checks re-enabled')
    
  } catch (error) {
    console.error('Database setup failed:', error.message)
    console.error('Full error:', error)
    throw error
  }
})

afterAll(async () => {
  await db.sequelize.close()
})

beforeEach(async () => {
  // Simple cleanup - delete data but keep tables
  const models = ['ElevatorQueue', 'ElevatorEvent', 'ElevatorCall', 'Elevator', 'Building', 'SqlQueryLog']
  
  for (const modelName of models) {
    if (db[modelName]) {
      await db[modelName].destroy({ where: {}, force: true })
    }
  }
})