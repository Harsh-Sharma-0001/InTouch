import express from 'express';
import Interview from '../models/Interview.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Interview stats
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    const scheduledInterviews = await Interview.countDocuments({ status: 'scheduled' });
    const cancelledInterviews = await Interview.countDocuments({ status: 'cancelled' });
    // Candidate stats
    const totalCandidates = await Candidate.countDocuments();
    const interviewing = await Candidate.countDocuments({ status: 'interviewing' });
    const offered = await Candidate.countDocuments({ status: 'offered' });
    const hired = await Candidate.countDocuments({ status: 'hired' });
    const rejected = await Candidate.countDocuments({ status: 'rejected' });
    res.json({
      interviews: { total: totalInterviews, completed: completedInterviews, scheduled: scheduledInterviews, cancelled: cancelledInterviews },
      candidates: { total: totalCandidates, interviewing, offered, hired, rejected }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/analytics
router.get('/analytics', async (req, res) => {
  try {
    // Example analytics data (you'd fetch real data based on filters)
    const monthlyInterviews = [
      { name: 'Jan', interviews: 40 }, { name: 'Feb', interviews: 30 },
      { name: 'Mar', interviews: 50 }, { name: 'Apr', interviews: 45 },
      { name: 'May', interviews: 60 }, { name: 'Jun', interviews: 55 },
    ];
    const passRates = [
      { name: 'Q1', 'Pass Rate': 75 }, { name: 'Q2', 'Pass Rate': 80 },
      { name: 'Q3', 'Pass Rate': 70 }, { name: 'Q4', 'Pass Rate': 85 },
    ];
    const candidatePipeline = [
      { name: 'Applied', value: 100 }, { name: 'Screening', value: 70 },
      { name: 'Interviewing', value: 50 }, { name: 'Offered', value: 20 },
      { name: 'Hired', value: 10 },
    ];
    const interviewerPerformance = [
      { name: 'Interviewer A', score: 4.5 }, { name: 'Interviewer B', score: 4.2 },
      { name: 'Interviewer C', score: 4.8 },
    ];
    const timeToHire = [
      { name: 'Jan', days: 25 }, { name: 'Feb', days: 22 },
      { name: 'Mar', days: 28 }, { name: 'Apr', days: 24 },
    ];
    res.json({ monthlyInterviews, passRates, candidatePipeline, interviewerPerformance, timeToHire });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics data', error: err.message });
  }
});

export default router; 