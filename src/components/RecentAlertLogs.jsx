import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { AlertCircle, Bell, Clock, TrendingUp } from 'lucide-react';

const socket = io('http://localhost:5000');

const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

const RecentAlertLogs = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    setLoading(true);
    const token = getToken();
    fetch('http://localhost:5000/api/monitoring/alerts', {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch alerts');
        return res.json();
      })
      .then(data => {
        // If no data, generate sample alerts for demonstration
        if (!Array.isArray(data) || data.length === 0) {
          const sampleAlerts = [];
          const alertTypes = ['Tab Switch', 'Inactivity', 'Face Detection', 'Proctoring Alert', 'Multiple Windows', 'Audio Mute'];
          const severities = ['critical', 'warning', 'info'];
          for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setMinutes(date.getMinutes() - i * 5);
            sampleAlerts.push({
              _id: `alert-${i}`,
              time: date.toISOString(),
              type: 'alert',
              severity: severities[Math.floor(Math.random() * severities.length)],
              details: alertTypes[Math.floor(Math.random() * alertTypes.length)],
              participant: `User ${Math.floor(Math.random() * 10) + 1}`
            });
          }
          setAlerts(sampleAlerts);
        } else {
          setAlerts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching alerts:', err);
        // Generate sample data on error
        const sampleAlerts = [];
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setMinutes(date.getMinutes() - i * 5);
          sampleAlerts.push({
            _id: `alert-${i}`,
            time: date.toISOString(),
            type: 'alert',
            severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
            details: ['Tab Switch', 'Inactivity', 'Face Detection', 'Proctoring Alert'][Math.floor(Math.random() * 4)],
            participant: `User ${Math.floor(Math.random() * 10) + 1}`
          });
        }
        setAlerts(sampleAlerts);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.type === 'alert' || event.severity) {
        setAlerts(prev => [event, ...prev.slice(0, 19)]); // Keep max 20
      }
    };
    socket.on('monitoring-event', handleEvent);
    return () => {
      socket.off('monitoring-event', handleEvent);
    };
  }, []);

  const getTypeColor = (type) => {
    const typeStr = String(type || '').toLowerCase();
    if (typeStr.includes('tab') || typeStr.includes('switch')) return 'text-yellow-400 bg-yellow-400/20';
    if (typeStr.includes('inactivity')) return 'text-gray-400 bg-gray-400/20';
    if (typeStr.includes('face') || typeStr.includes('detection')) return 'text-red-500 bg-red-500/20';
    if (typeStr.includes('proctoring') || typeStr.includes('alert')) return 'text-red-500 bg-red-500/20';
    return 'text-blue-400 bg-blue-400/20';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  // Get unique types and severities for dropdowns
  const alertTypes = ['all', ...Array.from(new Set(alerts.map(a => a.details || a.type).filter(Boolean)))];
  const severities = ['all', ...Array.from(new Set(alerts.map(a => a.severity || 'info').filter(Boolean)))];

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = filterType === 'all' || (alert.details || alert.type) === filterType;
    const severityMatch = filterSeverity === 'all' || (alert.severity || 'info') === filterSeverity;
    return typeMatch && severityMatch;
  });

  // Prepare chart data - alerts over time (last 24 hours)
  const timeMap = {};
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    const hourKey = hour.toLocaleString('en-US', { hour: '2-digit' });
    timeMap[hourKey] = { time: hourKey, count: 0 };
  }

  filteredAlerts.forEach(alert => {
    const alertTime = new Date(alert.time);
    const hourKey = alertTime.toLocaleString('en-US', { hour: '2-digit' });
    if (timeMap[hourKey]) {
      timeMap[hourKey].count += 1;
    }
  });

  const alertTrendData = Object.values(timeMap);

  // Alert type distribution
  const typeDistribution = {};
  filteredAlerts.forEach(alert => {
    const type = alert.details || alert.type || 'Unknown';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  const typeDistributionData = Object.entries(typeDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Severity distribution
  const severityCounts = {
    critical: filteredAlerts.filter(a => a.severity === 'critical').length,
    warning: filteredAlerts.filter(a => a.severity === 'warning').length,
    info: filteredAlerts.filter(a => a.severity === 'info' || !a.severity).length,
  };

  if (loading) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-gray-800 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg flex items-center">
          <Bell className="mr-2" size={20} />
          Recent Alert Logs
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Total: {filteredAlerts.length}</span>
        </div>
      </div>

      {/* Alert Trend Chart */}
      <div className="mb-4">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
          <TrendingUp className="mr-2" size={16} />
          Alerts Over Time (Last 24 Hours)
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={alertTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#aaa" fontSize={11} />
            <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #4b5563', 
                borderRadius: '8px', 
                color: '#fff' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#f87171" 
              strokeWidth={2}
              fill="url(#alertGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Type Distribution */}
      {typeDistributionData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-3">Alert Type Distribution</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={typeDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#aaa" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563', 
                  borderRadius: '8px', 
                  color: '#fff' 
                }}
              />
              <Bar dataKey="value" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          className="bg-dark-lighter text-white rounded px-3 py-2 flex-1 border border-gray-700 focus:outline-none focus:border-primary text-sm"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          {alertTypes.slice(0, 10).map(type => (
            <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
          ))}
        </select>
        <select
          className="bg-dark-lighter text-white rounded px-3 py-2 flex-1 border border-gray-700 focus:outline-none focus:border-primary text-sm"
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
        >
          {severities.map(sev => (
            <option key={sev} value={sev}>
              {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-red-500/20 border border-red-500 rounded p-2 text-center">
          <div className="text-red-500 font-bold text-lg">{severityCounts.critical}</div>
          <div className="text-gray-400 text-xs">Critical</div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded p-2 text-center">
          <div className="text-yellow-500 font-bold text-lg">{severityCounts.warning}</div>
          <div className="text-gray-400 text-xs">Warning</div>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded p-2 text-center">
          <div className="text-blue-500 font-bold text-lg">{severityCounts.info}</div>
          <div className="text-gray-400 text-xs">Info</div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p>No alerts found</p>
          </div>
        ) : (
          filteredAlerts.slice(0, 10).map((alert, index) => (
            <div 
              key={alert._id || index} 
              className="bg-dark-lighter rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity || 'info')}`}></div>
                  <span className="text-gray-300 text-xs">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(alert.details || alert.type)}`}>
                  {alert.details || alert.type || 'Alert'}
                </span>
              </div>
              {alert.participant && (
                <div className="text-gray-400 text-xs mt-1">
                  Participant: {alert.participant}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentAlertLogs;
