import mongoose from 'mongoose';
import Interview from './models/Interview.js';
import Candidate from './models/Candidate.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/intouch';

const sampleInterviews = [
  {
    time: '2024-07-12T09:00:00',
    title: 'Technical Assessment',
    candidate: 'Harsh Sharma',
    role: 'Software Engineer',
    duration: '60 mins',
    type: 'Online',
    platform: 'Google Meet',
    status: 'scheduled',
    interviewer: 'Kush Gupta',
    feedback: '',
    recordingUrl: '',
  },
  {
    time: '2024-07-12T11:30:00',
    title: 'Culture Fit Interview',
    candidate: 'Prakhar Patel',
    role: 'Product Designer',
    duration: '45 mins',
    type: 'In-person',
    platform: 'Conference Room 3',
    status: 'completed',
    interviewer: 'Aman Kuntal',
    feedback: 'Great fit for team.',
    recordingUrl: '',
  },
  {
    time: '2024-07-12T14:00:00',
    title: 'Hiring Manager Interview',
    candidate: 'Abhishek Rajput',
    role: 'Marketing Specialist',
    duration: '30 mins',
    type: 'Online',
    platform: 'Google Meet',
    status: 'scheduled',
    interviewer: 'Shrey Mehrotra',
    feedback: '',
    recordingUrl: '',
  },
  {
    time: '2024-07-12T16:00:00',
    title: 'Portfolio Review',
    candidate: 'Hariom Tiwari',
    role: 'Graphic Designer',
    duration: '60 mins',
    type: 'In-person',
    platform: 'Studio A',
    status: 'cancelled',
    interviewer: 'Harendra Pratap',
    feedback: '',
    recordingUrl: '',
  }
];

const sampleCandidates = [
  {
    name: 'Kush Gupta',
    email: 'kush.gupta@example.com',
    phone: '1234567890',
    role: 'Frontend Developer',
    resume: '',
    status: 'interviewing',
    notes: ''
  },
  {
    name: 'Aman Kuntal',
    email: 'aman.kuntal@example.com',
    phone: '2345678901',
    role: 'UI/UX Designer',
    resume: '',
    status: 'offered',
    notes: ''
  },
  {
    name: 'Shrey Mehrotra',
    email: 'shrey.mehrotra@example.com',
    phone: '3456789012',
    role: 'Data Analyst',
    resume: '',
    status: 'hired',
    notes: ''
  },
  {
    name: 'Harendra Pratap',
    email: 'harendra.pratap@example.com',
    phone: '4567890123',
    role: 'Cloud Engineer',
    resume: '',
    status: 'applied',
    notes: ''
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // Clear existing data
  await Interview.deleteMany({});
  await Candidate.deleteMany({});
  await User.deleteMany({});
  
  // Create test admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@intouch.com',
    password: hashedPassword,
    isAdmin: true
  });
  
  // Insert sample data
  await Interview.insertMany(sampleInterviews);
  await Candidate.insertMany(sampleCandidates);
  
  console.log('Database seeded!');
  console.log('Test admin user created: admin@intouch.com / admin123');
  await mongoose.disconnect();
}

seed(); 