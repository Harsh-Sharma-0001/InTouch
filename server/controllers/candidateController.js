import Candidate from '../models/Candidate.js';

// Get all candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create candidate
export const createCandidate = async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update candidate
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete candidate
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get candidate stats for dashboard
export const getCandidateStats = async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const interviewing = await Candidate.countDocuments({ status: 'interviewing' });
    const offered = await Candidate.countDocuments({ status: 'offered' });
    const hired = await Candidate.countDocuments({ status: 'hired' });
    const rejected = await Candidate.countDocuments({ status: 'rejected' });
    res.json({ total, interviewing, offered, hired, rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 