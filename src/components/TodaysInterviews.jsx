import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Video } from 'lucide-react';

function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

const TodaysInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/interviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch interviews');
        return res.json();
      })
      .then(data => {
        // Only show interviews scheduled for today
        setInterviews(data.filter(i => isToday(i.time)));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading today's interviews...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Today's Interviews</h2>
        <button className="text-primary hover:text-primary/80 text-sm" onClick={() => setShowAll(true)}>View All</button>
      </div>

      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="text-gray-text">No interviews scheduled for today.</div>
        ) : (
          interviews.slice(0, 4).map((interview, index) => (
            <div key={interview._id || index} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-center space-x-2 mb-1">
                <Clock size={14} className="text-gray-text" />
                <span className="text-sm font-medium text-white">{new Date(interview.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-white font-medium mb-1">{interview.title}</div>
              <div className="text-sm text-gray-text mb-2">
                {interview.candidate} &bull; {interview.role}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-text">
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{interview.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {interview.type === 'Online' ? (
                    <Video size={12} />
                  ) : (
                    <MapPin size={12} />
                  )}
                  <span>{interview.platform}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for all today's interviews */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowAll(false)}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">All Today's Interviews</h3>
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="text-gray-text">No interviews scheduled for today.</div>
              ) : (
                interviews.map((interview, index) => (
                  <div key={interview._id || index} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock size={14} className="text-gray-text" />
                      <span className="text-sm font-medium text-white">{new Date(interview.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-white font-medium mb-1">{interview.title}</div>
                    <div className="text-sm text-gray-text mb-2">
                      {interview.candidate} &bull; {interview.role}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-text">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{interview.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {interview.type === 'Online' ? (
                          <Video size={12} />
                        ) : (
                          <MapPin size={12} />
                        )}
                        <span>{interview.platform}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysInterviews;