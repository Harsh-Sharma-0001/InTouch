// import React from 'react';
// import { Routes, Route } from 'react-router-dom';

// import LandingPage from './pages/LandingPage';
// import DashboardPage from './pages/Dashboard';
// import MonitoringPage from './pages/Monitoring';
// import InterviewRoomPage from './pages/InterviewRoom';
// import AdminPanelPage from './pages/AdminPanel';

// import LoginPage from './components/LoginPage';
// import SignUpPage from './components/SignUpPage';

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/signup" element={<SignUpPage />} />
//       <Route path="/dashboard" element={<DashboardPage />} />
//       <Route path="/admin" element={<AdminPanelPage />} />
//       <Route path="/monitoring" element={<MonitoringPage />} />
//       <Route path="/interview" element={<InterviewRoomPage />} />
//     </Routes>
//   );
// }



import React from "react";
import { Routes, Route } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ForgotPassword from "./components/ForgotPassword";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/Dashboard";
import MonitoringPage from "./pages/Monitoring";
import MonitoringDetails from "./pages/MonitoringDetails";
import InterviewRoomPage from "./pages/InterviewRoom";
import AdminPanelPage from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import SignUpChoice from "./pages/SignUpChoice";
import Analytics from './pages/Analytics';
import Candidates from './pages/Candidates';
import LearnMore from './pages/LearnMore';
import About from './pages/About';
import RequestDemo from './pages/RequestDemo';
import AIAnalysisDashboard from './pages/AIAnalysisDashboard';
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
// import PrivateRoute from "./components/PrivateRoute"; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup-choice" element={<SignUpChoice />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/request-demo" element={<RequestDemo />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/about" element={<About />} />

      {/* <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      /> */}

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminPanelPage />
          </ProtectedAdminRoute>
        } 
      />
      <Route path="/monitoring" element={<MonitoringPage />} />
      <Route path="/monitoring-details" element={<MonitoringDetails />} />
      <Route path="/interview" element={<InterviewRoomPage />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/ai-analysis/:interviewId" element={<AIAnalysisDashboard />} />
    </Routes>
  );
}
