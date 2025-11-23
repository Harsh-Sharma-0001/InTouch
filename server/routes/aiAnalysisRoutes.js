import express from 'express';
import {
  processInterview,
  getAnalysis,
  analyzeJobFitEndpoint,
  generateQuestions,
  getTranscription
} from '../controllers/aiAnalysisController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

// Process interview recording (transcribe + analyze)
router.post('/process-interview', validateToken, processInterview);

// Get AI analysis for an interview
router.get('/analysis/:interviewId', validateToken, getAnalysis);

// Analyze job fit
router.post('/analyze-job-fit', validateToken, analyzeJobFitEndpoint);

// Generate interview questions
router.post('/generate-questions', validateToken, generateQuestions);

// Get transcription
router.get('/transcription/:interviewId', validateToken, getTranscription);

export default router;

