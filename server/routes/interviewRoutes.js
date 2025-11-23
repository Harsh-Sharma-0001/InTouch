import express from 'express';
import {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewStats,
  uploadRecording,
  deleteRecording,
  downloadRecording
} from '../controllers/interviewController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

router.get('/', getAllInterviews);
router.get('/stats', getInterviewStats);
router.get('/:id', getInterviewById);
router.post('/', createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/recording', validateToken, uploadRecording);
router.delete('/:id/recording', validateToken, deleteRecording);
router.get('/:id/recording/download', validateToken, downloadRecording);

export default router; 