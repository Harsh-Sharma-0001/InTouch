import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  questions: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Template', TemplateSchema); 