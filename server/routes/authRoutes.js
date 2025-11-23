import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAuditLogs,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyAdmin
} from '../controllers/authController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/signup', registerUser); // Add signup as an alias to register
router.post('/login', loginUser);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Admin verification
router.get('/verify-admin', validateToken, verifyAdmin);

// Admin user management
router.get('/users', validateToken, getAllUsers);
router.get('/users/:id', validateToken, getUserById);
router.put('/users/:id', validateToken, updateUser);
router.delete('/users/:id', validateToken, deleteUser);
router.get('/audit-logs', validateToken, getAuditLogs);

export default router;
