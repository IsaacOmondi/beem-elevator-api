require('dotenv').config();

const app = require('./src/app');
const db = require('./src/models');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Store server instance for graceful shutdown
let server;

async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`Elevator API server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      logger.info('HTTP server closed');
      
      try {
        // Close database connection
        await db.sequelize.close();
        logger.info('Database connection closed');
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing database connection:', error);
        process.exit(1);
      }
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000); // 10 seconds timeout
  } else {
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();