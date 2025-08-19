const express = require('express');
const cors = require('cors');

const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const buildingRoutes = require('./routes/buildings');
const { sqlLogger } = require('./middleware/sqlLogger');
const logRoutes = require('./routes/logs');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sqlLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const db = require('./models');
    await db.sequelize.authenticate();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// API Routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/logs', logRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;