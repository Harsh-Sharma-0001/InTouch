import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateAuditLogs
} from '../controllers/templateController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

router.get('/', validateToken, getAllTemplates);
router.get('/audit-logs', validateToken, getTemplateAuditLogs);
router.get('/:id', validateToken, getTemplateById);
router.post('/', validateToken, createTemplate);
router.put('/:id', validateToken, updateTemplate);
router.delete('/:id', validateToken, deleteTemplate);

export default router; 