import express from 'express';
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateStats
} from '../controllers/candidateController.js';

const router = express.Router();

router.get('/', getAllCandidates);
router.get('/stats', getCandidateStats);
router.get('/:id', getCandidateById);
router.post('/', createCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router; 