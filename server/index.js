import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interviewRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import aiAnalysisRoutes from './routes/aiAnalysisRoutes.js';
import { setSocketIO } from './controllers/monitoringController.js';
import path from 'path';
import { updateUser, deleteUser, registerUser } from './controllers/authController.js';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration - allow frontend URLs from environment or default to localhost
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intouch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setSocketIO(io);

// API routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/uploads/recordings', express.static(path.resolve('uploads/recordings')));

const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join-room', ({ roomId, user }) => {
    // Add null check for user object
    if (!user) {
      console.log(`User without data (${socket.id}) tried to join room ${roomId}`);
      return;
    }

    // Ensure user has a role (default to 'interviewee' if not provided)
    const userWithRole = {
      ...user,
      role: user.role || 'interviewee' // 'interviewer' or 'interviewee'
    };

    if (rooms[roomId]) {
      // Check if user already exists in room
      const existingUserIndex = rooms[roomId].findIndex((u) => u.id === socket.id);
      if (existingUserIndex === -1) {
        rooms[roomId].push({ id: socket.id, ...userWithRole });
      } else {
        // Update existing user
        rooms[roomId][existingUserIndex] = { id: socket.id, ...userWithRole };
      }
    } else {
      rooms[roomId] = [{ id: socket.id, ...userWithRole }];
    }

    socket.join(roomId);

    // Get all other users in the room (for mesh peer connections)
    const otherUsers = rooms[roomId].filter((u) => u.id !== socket.id);
    
    // Send all existing users to the newly joined user
    socket.emit('other-users', otherUsers);

    // Notify all other users in the room about the new user
    socket.to(roomId).emit('user-joined', { id: socket.id, ...userWithRole });

    console.log(`User ${userWithRole.name || 'Unknown'} (${userWithRole.role}) (${socket.id}) joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${rooms[roomId].length} participant(s)`);
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', payload);
  });

  // Handle leave-room event explicitly
  socket.on('leave-room', (roomId) => {
    if (rooms[roomId]) {
      const userIndex = rooms[roomId].findIndex((u) => u.id === socket.id);
      if (userIndex !== -1) {
        const user = rooms[roomId][userIndex];
        rooms[roomId].splice(userIndex, 1);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
        socket.to(roomId).emit('user-left', socket.id);
        console.log(`User ${user.name || 'Unknown'} (${socket.id}) left room ${roomId}`);
      }
    }
    socket.leave(roomId);
  });

  socket.on('user-created', (user) => {
    io.emit('user-created', user);
  });
  socket.on('user-updated', (user) => {
    io.emit('user-updated', user);
  });
  socket.on('user-deleted', (userId) => {
    io.emit('user-deleted', userId);
  });

  const leaveRoom = () => {
    let roomIdToRemove = null;
    let userToRemove = null;

    for (const roomId in rooms) {
      const users = rooms[roomId];
      const userIndex = users.findIndex((user) => user.id === socket.id);
      if (userIndex !== -1) {
        userToRemove = users[userIndex];
        users.splice(userIndex, 1);
        roomIdToRemove = roomId;
        if (users.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }

    if (roomIdToRemove) {
      socket.to(roomIdToRemove).emit('user-left', socket.id);
      console.log(`User ${userToRemove?.name} (${socket.id}) left room ${roomIdToRemove}`);
      console.log('Current rooms state:', rooms);
    }
  };

  socket.on('end-meeting', () => {
    leaveRoom();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    leaveRoom();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

