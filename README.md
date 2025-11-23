# InTouch - AI-Powered Video Interview & Monitoring Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16.4-yellow.svg)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> **Revolutionizing the hiring process through AI-powered attention tracking, behavioral analysis, and intelligent candidate assessment.**

## 🚀 Overview

InTouch is a comprehensive AI-powered interview and monitoring platform designed to transform the hiring process. The platform combines advanced face detection, eye tracking, and attention analytics to provide real-time insights into candidate behavior, engagement, and performance during interviews.

### ✨ Key Features

- **🎥 Real-time Video Conferencing** - High-quality video interviews with WebRTC
- **🧠 AI-Powered Attention Tracking** - TensorFlow.js-based face and eye detection
- **📊 Behavioral Analytics** - Real-time attention scoring and performance metrics
- **🔄 Live Monitoring** - Real-time interview monitoring and risk assessment
- **💻 Technical Assessment Tools** - Integrated code editor and whiteboard
- **📱 Responsive Design** - Mobile-first approach with modern UI/UX
- **🔐 Secure Authentication** - JWT-based authentication with role management
- **📈 Comprehensive Analytics** - Detailed reporting and performance insights

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Interview     │    │ • REST APIs     │    │ • Users         │
│ • Dashboard     │    │ • WebSocket     │    │ • Candidates    │
│ • Monitoring    │    │ • AI Services   │    │ • Interviews    │
│ • Analytics     │    │ • File Storage  │    │ • Templates     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3.1 with Vite
- **UI Library**: Tailwind CSS 3.4.4
- **State Management**: Redux Toolkit 2.2.6
- **Routing**: React Router DOM 6.24.0
- **Real-time Communication**: Socket.IO Client 4.7.5
- **AI/ML**: TensorFlow.js 4.22.0
- **Charts**: Recharts 3.1.0
- **Icons**: Lucide React 0.395.0

### Backend
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB 8.16.4 with Mongoose
- **Real-time Communication**: Socket.IO 4.8.1
- **Authentication**: JWT 9.0.2, bcryptjs 3.0.2
- **Email**: Nodemailer 7.0.5
- **File Upload**: Multer 1.4.5-lts.1
- **AI Integration**: Together AI 0.20.0

### Development Tools
- **Build Tool**: Vite 4.3.1
- **Linting**: ESLint 8.57.0
- **Package Manager**: npm
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 8.16.4+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harsh-Sharma-0001/InTouch.git
   cd InTouch
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in server directory
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Run the development servers**

   **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   ```

   **Terminal 2 - Backend:**
   ```bash
   npm run server
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 📁 Project Structure

```
in-touch/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── layouts/           # Layout components
│   ├── hooks/             # Custom React hooks
│   └── assets/            # Static assets
├── server/                 # Backend source code
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── uploads/           # File uploads
├── public/                 # Public assets
└── mongo-data/            # MongoDB data directory
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run server` - Start backend server
- `cd server && npm run dev` - Start backend with nodemon
- `cd server && npm start` - Start production backend

## 🌟 Core Features

### 1. **AI-Powered Attention Tracking**
- Real-time face detection using TensorFlow.js
- Eye tracking and gaze direction analysis
- Attention score calculation (0-100%)
- Behavioral pattern recognition

### 2. **Interview Management**
- High-quality video conferencing
- Screen sharing capabilities
- Interview recording and playback
- Real-time chat and whiteboard
- Integrated code editor for technical assessments

### 3. **Live Monitoring Dashboard**
- Real-time interview feeds
- Risk scoring and anomaly detection
- Performance metrics and analytics
- Automated alert system

### 4. **Candidate Management**
- Comprehensive candidate profiles
- Document upload and management
- Assessment history tracking
- Performance analytics

### 5. **Admin Panel**
- User management and role assignment
- System configuration
- Template management
- System-wide analytics

## 📱 Screenshots

*[Add screenshots of your application here]*


## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Contributing Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🎯 Multi-User Video Calling

InTouch supports real-time multi-user video calling with role-based participation:

### Joining as Interviewer
```
http://localhost:5173/interview?roomId=room-123&role=interviewer
```

### Joining as Interviewee
```
http://localhost:5173/interview?roomId=room-123&role=interviewee
```

### Features
- **Mesh Topology**: Each participant creates peer connections with all other participants
- **Role-Based Routing**: Interviewer video automatically appears in dedicated section
- **Dynamic Connections**: New participants automatically connect to existing ones
- **Screen Sharing**: Works seamlessly with multiple participants

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/intouch

# Authentication
JWT_SECRET=your_jwt_secret_here

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# AI Services
OPENAI_API_KEY=your_openai_api_key
TOGETHER_AI_API_KEY=your_together_ai_key

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

### Email Setup
1. For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833)
2. For other providers: Update `EMAIL_SERVICE` in `.env`

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Render/Railway)
```bash
cd server
npm install --production
npm start
```

### Environment Variables for Production
- Set all environment variables in your hosting platform
- Update `FRONTEND_URL` with your production frontend URL
- Use production MongoDB URI (MongoDB Atlas recommended)

## 🐛 Troubleshooting

### Video Not Showing
- Check browser console for WebRTC errors
- Verify camera/microphone permissions
- Check network connectivity
- Ensure both users are in the same room

### Face Detection Not Working
- Ensure camera permissions are granted
- Check browser console for TensorFlow.js errors
- Verify WebGL support in browser
- Try refreshing the page

### Connection Issues
- Check Socket.IO connection in browser console
- Verify backend server is running
- Check CORS configuration
- Ensure STUN servers are accessible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Harsh-Sharma-0001/InTouch/issues)
- **Email**: panditharshsharma34@gmail.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://mongodb.com/) - Database
- [TensorFlow.js](https://www.tensorflow.org/js) - AI/ML library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Socket.IO](https://socket.io/) - Real-time communication

---

**Made with ❤️ by me**

*Revolutionizing hiring through AI-powered insights*
