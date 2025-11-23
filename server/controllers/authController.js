import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// In-memory storage for reset codes (in production, use Redis or database)
const resetCodes = new Map();

export const registerUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, isAdmin: !!isAdmin });

    // Audit log
    if (req.user && req.user.email) {
      await AuditLog.create({
        action: 'create',
        admin: req.user.email,
        target: email,
        details: `Created user ${email} (${name})${isAdmin ? ' [admin]' : ''}`
      });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin },
      token,
    });
    } catch (err) {
    console.error("Login error:", err); 
    res.status(500).json({ message: "Login failed", error: err.message }); 
  }
};

// Forgot Password - Send Reset Code
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with expiration (10 minutes)
    resetCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send verification code via email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (emailResult.success) {
      console.log(`✅ Password reset code sent to ${email}`);
      res.json({ 
        message: 'Verification code sent to your email address. Please check your inbox and spam folder.',
        success: true
      });
    } else {
      console.error(`❌ Failed to send reset code to ${email}`);
      res.status(500).json({ 
        message: 'Failed to send verification email. Please try again or contact support.',
        success: false
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: 'Failed to send verification code', error: err.message });
  }
};

// Verify Reset Code
export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const resetData = resetCodes.get(email);
    
    if (!resetData) {
      return res.status(400).json({ message: 'No reset code found for this email' });
    }

    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ message: 'Failed to verify code', error: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const resetData = resetCodes.get(email);
    
    if (!resetData) {
      return res.status(400).json({ message: 'No reset code found for this email' });
    }

    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Find and update user password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove the reset code
    resetCodes.delete(email);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};

// --- Admin CRUD ---
export const getAllUsers = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

export const getUserById = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, email, isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isAdmin },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Audit log
    await AuditLog.create({
      action: 'update',
      admin: req.user.email,
      target: user.email,
      details: `Updated user ${user.email} (${user.name}) [admin: ${isAdmin}]`
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Audit log
    await AuditLog.create({
      action: 'delete',
      admin: req.user.email,
      target: user.email,
      details: `Deleted user ${user.email} (${user.name})`
    });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const logs = await AuditLog.find().sort({ time: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};

// Verify if user is admin
export const verifyAdmin = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated', isAdmin: false });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', isAdmin: false });
    }

    res.json({ 
      isAdmin: user.isAdmin || false,
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message, isAdmin: false });
  }
};
