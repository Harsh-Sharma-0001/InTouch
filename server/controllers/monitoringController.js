import MonitoringEvent from '../models/MonitoringEvent.js';
import Interview from '../models/Interview.js';

let io = null;
export const setSocketIO = (ioInstance) => {
  io = ioInstance;
};

// POST /api/monitoring/event
export const createMonitoringEvent = async (req, res) => {
  try {
    const event = new MonitoringEvent(req.body);
    await event.save();
    if (io) {
      io.emit('monitoring-event', event); // Real-time update to all clients
    }
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/metrics
export const getMetrics = async (req, res) => {
  try {
    const allClear = await MonitoringEvent.countDocuments({ type: 'info' });
    const minorFlags = await MonitoringEvent.countDocuments({ severity: 'warning' });
    const criticalAlerts = await MonitoringEvent.countDocuments({ severity: 'critical' });
    res.json({ allClear, minorFlags, criticalAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/active-interviews
export const getActiveInterviews = async (req, res) => {
  try {
    const now = new Date();
    const interviews = await Interview.find({
      time: { $lte: now },
      $or: [
        { status: 'scheduled' },
        { status: 'in-progress' }
      ]
    });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await MonitoringEvent.find({ type: 'alert' }).sort({ time: -1 }).limit(20);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/risk-scores
export const getRiskScores = async (req, res) => {
  try {
    const risks = await MonitoringEvent.find({ type: 'risk' }).sort({ time: -1 }).limit(20);
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/anomalies
export const getAnomalies = async (req, res) => {
  try {
    const anomalies = await MonitoringEvent.find({ type: 'anomaly' }).sort({ time: -1 }).limit(20);
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/monitoring/timeline
export const getTimeline = async (req, res) => {
  try {
    const events = await MonitoringEvent.find().sort({ time: -1 }).limit(50);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 