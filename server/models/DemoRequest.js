import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
  },
  phone: {
    type: String,
    trim: true
  },
  preferredDate: {
    type: Date
  },
  preferredTime: {
    type: String
  },
  specificRequirements: {
    type: String,
    trim: true
  },
  hearAboutUs: {
    type: String,
    enum: ['Google Search', 'Social Media', 'Referral', 'Industry Event', 'Other']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
demoRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

export default DemoRequest;