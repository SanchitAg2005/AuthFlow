const express = require('express');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Retrieve system health and connection status
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System health metadata fetched successfully
 */
router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStateIndex = mongoose.connection.readyState;
  const dbStatus = dbStateIndex === 1 ? 'UP' : 'DOWN';

  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    services: {
      database: {
        status: dbStatus,
        state: dbStates[dbStateIndex] || 'unknown'
      },
      server: {
        status: 'UP',
        nodeVersion: process.version
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
