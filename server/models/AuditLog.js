import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'create', 'update', 'delete'
  admin: { type: String, required: true }, // admin email or id
  target: { type: String }, // e.g. user id/email
  details: { type: String }, // description
  time: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', AuditLogSchema); 