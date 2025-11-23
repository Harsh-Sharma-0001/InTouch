import mongoose from 'mongoose';

const MonitoringEventSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. 'alert', 'join', 'leave', 'risk', 'anomaly'
  time: { type: Date, default: Date.now },
  participant: { type: String }, // name or id
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  details: { type: String },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' }
});

export default mongoose.model('MonitoringEvent', MonitoringEventSchema); 