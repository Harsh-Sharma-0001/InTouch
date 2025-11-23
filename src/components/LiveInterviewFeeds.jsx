import React, { useEffect, useState, useRef } from 'react';
import { Video } from 'lucide-react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/config.js';

const socket = io(SOCKET_URL);

const LiveInterviewFeeds = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetchTimeout = useRef(null);

  const fetchInterviews = () => {
    setLoading(true);
    fetch('/api/monitoring/active-interviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch active interviews');
        return res.json();
      })
      .then(data => {
        setInterviews(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      if (["join", "leave", "status"].includes(event.type)) {
        if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
        refetchTimeout.current = setTimeout(fetchInterviews, 300);
      }
    };
    socket.on('monitoring-event', handleEvent);
    return () => {
      socket.off('monitoring-event', handleEvent);
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
      case 'live':
        return 'bg-green-500';
      case 'flagged':
        return 'bg-yellow-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'live':
        return 'Live';
      case 'flagged':
        return 'Flagged';
      case 'ended':
        return 'Ended';
      default:
        return status;
    }
  };

  if (loading) return <div className="bg-dark-card rounded-lg p-6">Loading live interview feeds...</div>;
  if (error) return <div className="bg-dark-card rounded-lg p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Live Interview Feeds</h3>
      <div className="grid grid-cols-2 gap-4">
        {interviews.length === 0 ? (
          <div className="col-span-2 text-gray-400 text-center">No active interviews.</div>
        ) : (
          interviews.map((interview, idx) => (
            <div key={interview._id || idx} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-medium text-sm">{interview.candidate?.split(' ').map(n => n[0]).join('') || '?'}</span>
                  </div>
                  <Video size={20} className="text-gray-400 mx-auto" />
                </div>
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(interview.status)}`}>
                {getStatusText(interview.status)}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white font-medium text-sm">{interview.candidate}</p>
                <p className="text-gray-300 text-xs">{interview.role}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveInterviewFeeds;
