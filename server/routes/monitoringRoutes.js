import express from 'express';
import {
  getMetrics,
  getActiveInterviews,
  getAlerts,
  getRiskScores,
  getAnomalies,
  getTimeline,
  createMonitoringEvent
} from '../controllers/monitoringController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

router.get('/metrics', getMetrics);
router.get('/active-interviews', getActiveInterviews);
router.get('/alerts', getAlerts);
router.get('/risk-scores', getRiskScores);
router.get('/anomalies', getAnomalies);
router.get('/timeline', getTimeline);
router.post('/event', createMonitoringEvent);

// GET /api/monitoring/session/:sessionId/events
router.get('/session/:sessionId/events', validateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // In a real app, you'd fetch events from the database
    // For now, return sample monitoring events
    const sampleEvents = [
      {
        id: 1,
        type: 'info',
        severity: 'info',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        description: 'Session started successfully',
        details: 'All monitoring systems active'
      },
      {
        id: 2,
        type: 'warning',
        severity: 'warning',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        description: 'Tab switch detected',
        details: 'User switched to another tab for 5 seconds'
      },
      {
        id: 3,
        type: 'info',
        severity: 'info',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        description: 'Session completed',
        details: 'Interview ended normally'
      }
    ];
    
    res.json(sampleEvents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session events', error: err.message });
  }
});

export default router; 