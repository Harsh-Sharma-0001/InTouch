import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const socket = io('http://localhost:5000');

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterParticipant, setFilterParticipant] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch('/api/monitoring/timeline')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch timeline');
        return res.json();
      })
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      setActivities(prev => [event, ...prev.slice(0, 49)]);
    };
    socket.on('monitoring-event', handleEvent);
    return () => {
      socket.off('monitoring-event', handleEvent);
    };
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-gray-500';
    }
  };

  // Get unique types and participants for dropdowns
  const types = ['all', ...Array.from(new Set(activities.map(a => a.type)))];
  const participants = ['all', ...Array.from(new Set(activities.map(a => a.participant).filter(Boolean)))]

  // Filter activities
  const filtered = activities.filter(a => {
    const typeMatch = filterType === 'all' || a.type === filterType;
    const participantMatch = filterParticipant === 'all' || a.participant === filterParticipant;
    return typeMatch && participantMatch;
  });

  // Prepare bar chart data (event counts by type)
  const typeCounts = types.slice(1).map(type => ({
    type,
    count: activities.filter(a => a.type === type).length
  })).filter(d => d.count > 0);

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-border-color shadow-sm text-white">
      <h3 className="text-white font-semibold text-lg mb-4">Activity Timeline</h3>
      <div className="flex gap-4 mb-4">
        <select
          className="bg-dark-lighter text-white rounded px-2 py-1"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          {types.map(type => (
            <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
          ))}
        </select>
        <select
          className="bg-dark-lighter text-white rounded px-2 py-1"
          value={filterParticipant}
          onChange={e => setFilterParticipant(e.target.value)}
        >
          {participants.map(p => (
            <option key={p} value={p}>{p === 'all' ? 'All Participants' : p}</option>
          ))}
        </select>
      </div>
      {/* Bar chart for event counts by type */}
      {typeCounts.length > 0 && (
        <div className="w-full h-32 mb-4">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={typeCounts} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="type" stroke="#aaa" fontSize={10} />
              <YAxis stroke="#aaa" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
              <Bar dataKey="count" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {loading ? (
        <div className="h-20 flex items-center justify-center text-gray-400">Loading timeline...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-gray-400 text-center">No recent activity.</div>
          ) : (
            filtered.map((activity, index) => (
              <div key={activity._id || index} className="flex items-start space-x-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(activity.severity)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-text text-sm">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {activity.participant && <span className="text-xs text-primary">{activity.participant}</span>}
                  </div>
                  <p className="text-gray-300 text-sm">{activity.details || activity.type}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;