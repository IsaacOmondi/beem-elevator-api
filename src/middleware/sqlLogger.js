const logger = require('../config/logger');

// Store current request path globally
let currentRequestPath = null;

const sqlLogger = (req, res, next) => {
  // Store the current request path
  currentRequestPath = req.originalUrl;
  // Clear it when request finishes
  res.on('finish', () => {
    currentRequestPath = null;
  });
  
  next();
};

const sequelizeLogger = (sql) => {
  // Log to Winston for debugging
  logger.debug('SQL Query:', {
    query: sql?.substring(0, 200),
    path: currentRequestPath || 'internal'
  });

  console.log('sql', sql && !sql.includes('sql_query_logs'));
  
  // Only log actual queries (skip our own logging queries)
  if (sql && !sql.includes('sql_query_logs')) {
    // Log to database asynchronously
    setImmediate(async () => {
      try {
        const db = require('../models');
        
        // Only log if request path is available, avoid internal logging
        if (currentRequestPath) {
            // Simple raw insert to avoid circular logging
            await db.sequelize.query(
              `INSERT INTO sql_query_logs (sql_query, request_path, created_at) VALUES (?, ?, NOW())`,
              {
                replacements: [
                  sql.substring(0, 5000), // Limit SQL length to prevent huge queries
                  currentRequestPath
                ],
                type: db.Sequelize.QueryTypes.INSERT,
                logging: false // Critical: prevent recursive logging
              }
            );
        }
      } catch (error) {
        // Silently fail to avoid breaking the application
        logger.error('Failed to log SQL query:', error.message);
      }
    });
  }
};

module.exports = { sqlLogger, sequelizeLogger };