import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Video, Activity } from 'lucide-react';
import Footer from '../components/Footer';

const MonitoringDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionData, setSessionData] = useState(null);
  const [monitoringEvents, setMonitoringEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch session details and monitoring events
    Promise.all([
      fetch(`/api/interviews/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(async res => {
        if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
        if (res.status === 404) throw new Error('Session not found.');
        if (!res.ok) throw new Error('Failed to fetch session details.');
        return res.json();
      }),
      fetch(`/api/monitoring/session/${sessionId}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(async res => {
        if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
        if (res.status === 404) throw new Error('No monitoring events found.');
        if (!res.ok) throw new Error('Failed to fetch monitoring events.');
        return res.json();
      })
    ])
      .then(([session, events]) => {
        setSessionData(session);
        setMonitoringEvents(events);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId, navigate]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info':
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Activity className="text-blue-500" size={16} />;
    }
  };

  const getEventColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-500/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-500/10';
      default:
        return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-700 rounded mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
              <h1 className="text-2xl font-bold mb-2">Error</h1>
              <p className="text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/monitoring')}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
              >
                Back to Monitoring
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => navigate('/monitoring')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Monitoring</span>
            </button>
          </div>

          {/* Session Details */}
          {sessionData && (
            <div className="bg-dark-card rounded-lg p-6 border border-border-color mb-6">
              <h1 className="text-2xl font-bold mb-4">Session Details</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Candidate</p>
                    <p className="font-medium">{sessionData.candidateName || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Video className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Interview Type</p>
                    <p className="font-medium">{sessionData.type || 'Video Interview'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="font-medium">{sessionData.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className={`font-medium ${
                      sessionData.status === 'completed' ? 'text-green-500' : 
                      sessionData.status === 'scheduled' ? 'text-blue-500' : 'text-red-500'
                    }`}>
                      {sessionData.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Risk Score</p>
                    <p className="font-medium">Low</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-primary" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Integrity</p>
                    <p className="font-medium text-green-500">Passed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Events Timeline */}
          <div className="bg-dark-card rounded-lg p-6 border border-border-color">
            <h2 className="text-xl font-semibold mb-4">Monitoring Events</h2>
            {monitoringEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400">No monitoring events detected. Session appears to be clean.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monitoringEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${getEventColor(event.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white">{event.type}</h3>
                          <span className="text-sm text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{event.description}</p>
                        {event.details && (
                          <p className="text-gray-400 text-xs mt-1">{event.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={() => window.open(`/api/interviews/${sessionId}/recording`, '_blank')}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            >
              View Recording
            </button>
            <button 
              onClick={() => navigate('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Generate Report
            </button>
            <button 
              onClick={() => navigate('/monitoring')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Back to Monitoring
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MonitoringDetails; 