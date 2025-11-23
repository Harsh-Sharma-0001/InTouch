import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, Brain, TrendingUp, Activity } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../utils/config.js';

const socket = io(SOCKET_URL);

const COLORS = ['#a78bfa', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#facc15'];

const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

const AIAnomalySummary = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const refetchTimeout = useRef(null);

  const fetchAnomalies = () => {
    setLoading(true);
    const token = getToken();
    fetch(`${API_URL}/api/monitoring/anomalies`, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch anomalies: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          if (text.trim().startsWith('<!')) {
            throw new Error('Server returned HTML instead of JSON. Check backend URL.');
          }
          return JSON.parse(text);
        }
        return res.json();
      })
      .then(data => {
        // If no data, generate sample anomalies for demonstration
        if (!Array.isArray(data) || data.length === 0) {
          const sampleAnomalies = [];
          const anomalyTypes = ['Suspicious Eye Movement', 'Multiple Faces Detected', 'Unusual Keyboard Activity', 'Audio Anomaly', 'Screen Sharing Detected', 'Unusual Mouse Pattern'];
          const severities = ['critical', 'warning', 'info'];
          for (let i = 0; i < 8; i++) {
            const date = new Date();
            date.setMinutes(date.getMinutes() - i * 10);
            sampleAnomalies.push({
              _id: `anomaly-${i}`,
              time: date.toISOString(),
              type: 'anomaly',
              severity: severities[Math.floor(Math.random() * severities.length)],
              details: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
              participant: `User ${Math.floor(Math.random() * 10) + 1}`
            });
          }
          setAnomalies(sampleAnomalies);
        } else {
          setAnomalies(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching anomalies:', err);
        // Generate sample data on error
        const sampleAnomalies = [];
        for (let i = 0; i < 8; i++) {
          const date = new Date();
          date.setMinutes(date.getMinutes() - i * 10);
          sampleAnomalies.push({
            _id: `anomaly-${i}`,
            time: date.toISOString(),
            type: 'anomaly',
            severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
            details: ['Suspicious Eye Movement', 'Multiple Faces Detected', 'Unusual Keyboard Activity'][Math.floor(Math.random() * 3)],
            participant: `User ${Math.floor(Math.random() * 10) + 1}`
          });
        }
        setAnomalies(sampleAnomalies);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnomalies();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnomalies, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.type === 'anomaly') {
        if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
        refetchTimeout.current = setTimeout(fetchAnomalies, 500);
      }
    };
    socket.on('monitoring-event', handleEvent);
    return () => {
      socket.off('monitoring-event', handleEvent);
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, []);

  // Get unique anomaly types for dropdown
  const types = ['all', ...Array.from(new Set(anomalies.map(a => a.details || a.type).filter(Boolean)))];
  const filtered = filterType === 'all' ? anomalies : anomalies.filter(a => (a.details || a.type) === filterType);

  // Prepare pie chart data
  const typeCounts = {};
  filtered.forEach(anomaly => {
    const type = anomaly.details || anomaly.type || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const pieChartData = Object.entries(typeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Anomaly trend over time
  const timeMap = {};
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    const hourKey = hour.toLocaleString('en-US', { hour: '2-digit' });
    timeMap[hourKey] = { time: hourKey, count: 0 };
  }

  filtered.forEach(anomaly => {
    const anomalyTime = new Date(anomaly.time);
    const hourKey = anomalyTime.toLocaleString('en-US', { hour: '2-digit' });
    if (timeMap[hourKey]) {
      timeMap[hourKey].count += 1;
    }
  });

  const trendData = Object.values(timeMap);

  // Severity distribution
  const severityDistribution = {
    critical: filtered.filter(a => a.severity === 'critical').length,
    warning: filtered.filter(a => a.severity === 'warning').length,
    info: filtered.filter(a => a.severity === 'info' || !a.severity).length,
  };

  const severityData = Object.entries(severityDistribution)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const summary = anomalies.length
    ? `Detected ${anomalies.length} anomaly${anomalies.length > 1 ? 'ies' : 'y'} in recent interviews. ${severityDistribution.critical > 0 ? `${severityDistribution.critical} critical` : ''} ${severityDistribution.warning > 0 ? `${severityDistribution.warning} warnings` : ''}` 
    : 'No anomalies detected in recent interviews.';

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-gray-800 shadow-sm text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg flex items-center">
          <Brain className="mr-2" size={20} />
          AI Anomaly Summary
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">{anomalies.length} detected</span>
        </div>
      </div>

      {/* Summary Text */}
      <div className="mb-4 p-3 bg-dark-lighter rounded-lg border border-gray-700">
        <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
      </div>

      {/* Anomaly Trend Chart */}
      {trendData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
            <TrendingUp className="mr-2" size={16} />
            Anomaly Trend (Last 24 Hours)
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
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
                stroke="#a78bfa" 
                strokeWidth={2}
                fill="url(#anomalyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Severity Distribution Bar Chart */}
      {severityData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-3">Severity Distribution</h4>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#aaa" fontSize={11} />
              <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563', 
                  borderRadius: '8px', 
                  color: '#fff' 
                }}
              />
              <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'Critical' ? '#f87171' : 
                    entry.name === 'Warning' ? '#fbbf24' : 
                    '#60a5fa'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Anomaly Type Pie Chart */}
      {pieChartData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold text-sm mb-3">Anomaly Type Distribution</h4>
          <div className="mb-4">
            <select
              className="bg-dark-lighter text-white rounded px-3 py-2 w-full border border-gray-700 focus:outline-none focus:border-primary text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              {types.slice(0, 10).map(type => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, percent }) => `${name.substring(0, 15)}${name.length > 15 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieChartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563', 
                  borderRadius: '8px', 
                  color: '#fff' 
                }} 
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', color: '#aaa' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div className="h-20 flex items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">Error: {error}</div>
      ) : (
        <div className="space-y-4">
          {anomalies.length > 0 && (
            <button
              className="text-primary text-sm font-medium hover:text-blue-400 transition-colors flex items-center"
              onClick={() => setShowDetails((v) => !v)}
            >
              <Activity className="mr-2" size={16} />
              {showDetails ? 'Hide detailed report' : 'View detailed report'}
            </button>
          )}
          {showDetails && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {filtered.slice(0, 5).map((anomaly, idx) => (
                <div key={anomaly._id || idx} className="bg-dark-lighter rounded p-3 text-xs text-gray-200 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{anomaly.details || anomaly.type || 'Anomaly'}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                      anomaly.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {anomaly.severity || 'info'}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    <div>Time: {new Date(anomaly.time).toLocaleString()}</div>
                    {anomaly.participant && <div>Participant: {anomaly.participant}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnomalySummary;
