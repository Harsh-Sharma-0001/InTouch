import Interview from '../models/Interview.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const recordingsDir = path.resolve('uploads/recordings');
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, recordingsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `interview-${req.params.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Get all interviews
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ time: 1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get interview by ID
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create interview
export const createInterview = async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json(interview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update interview
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get interview stats for dashboard
export const getInterviewStats = async (req, res) => {
  try {
    const total = await Interview.countDocuments();
    const completed = await Interview.countDocuments({ status: 'completed' });
    const scheduled = await Interview.countDocuments({ status: 'scheduled' });
    const cancelled = await Interview.countDocuments({ status: 'cancelled' });
    res.json({ total, completed, scheduled, cancelled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadRecording = [
  upload.single('recording'),
  async (req, res) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Remove old file if exists
    if (interview.recordingFileName) {
      const oldPath = path.join(recordingsDir, interview.recordingFileName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    interview.recordingUrl = `/uploads/recordings/${req.file.filename}`;
    interview.recordingFileName = req.file.filename;
    await interview.save();
    res.json({ message: 'Recording uploaded', url: interview.recordingUrl });
  }
];

export const deleteRecording = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });
  if (interview.recordingFileName) {
    const filePath = path.join(recordingsDir, interview.recordingFileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  interview.recordingUrl = '';
  interview.recordingFileName = '';
  await interview.save();
  res.json({ message: 'Recording deleted' });
};

export const downloadRecording = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });
  if (!interview.recordingFileName) return res.status(404).json({ error: 'No recording found' });
  const filePath = path.join(recordingsDir, interview.recordingFileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath, interview.recordingFileName);
}; 