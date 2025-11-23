import express from 'express';
import {
  createDemoRequest,
  getDemoRequests,
  updateDemoRequestStatus
} from '../controllers/demoController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

// Public route - anyone can request a demo
router.post('/request', createDemoRequest);

// Protected routes - require authentication (for admin)
router.get('/', validateToken, getDemoRequests);
router.put('/:id/status', validateToken, updateDemoRequestStatus);

export default router;