import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  time: String,
  title: String,
  candidate: String,
  role: String,
  duration: String,
  type: String,
  platform: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'in-progress'], default: 'scheduled' },
  feedback: { type: String, default: '' },
  interviewer: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  recordingFileName: { type: String, default: '' },
  recordingS3Key: { type: String, default: '' },
  aiAnalysis: {
    transcription: { type: String, default: '' },
    transcriptionUrl: { type: String, default: '' },
    analysis: { type: mongoose.Schema.Types.Mixed },
    communicationAnalysis: { type: mongoose.Schema.Types.Mixed },
    sentimentAnalysis: { type: mongoose.Schema.Types.Mixed },
    keyPhrases: { type: mongoose.Schema.Types.Mixed },
    subtitles: { type: String, default: '' },
    jobFitAnalysis: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model('Interview', InterviewSchema);
