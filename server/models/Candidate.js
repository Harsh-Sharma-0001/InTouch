import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String },
  resume: { type: String }, // URL or file path
  status: { type: String, enum: ['applied', 'interviewing', 'offered', 'hired', 'rejected'], default: 'applied' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Candidate', CandidateSchema); 