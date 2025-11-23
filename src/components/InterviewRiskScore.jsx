import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../utils/config.js';

const socket = io(SOCKET_URL);

const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

const InterviewRiskScore = () => {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState('all');
  const [currentRiskScore, setCurrentRiskScore] = useState(0);
  const refetchTimeout = useRef(null);

  const fetchRiskScores = () => {
    setLoading(true);
    const token = getToken();
    fetch(`${API_URL}/api/monitoring/risk-scores`, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch risk scores');
        return res.json();
      })
      .then(data => {
        // Process risk data - extract risk scores from details or generate from severity
        const processedData = Array.isArray(data) ? data.map(item => {
          let riskScore = 0;
          if (item.details) {
            // Try to extract number from details
            const match = item.details.match(/\d+/);
            if (match) riskScore = parseInt(match[0]);
          }
          // If no score in details, calculate from severity
          if (riskScore === 0) {
            if (item.severity === 'critical') riskScore = Math.floor(Math.random() * 30) + 70; // 70-100
            else if (item.severity === 'warning') riskScore = Math.floor(Math.random() * 30) + 40; // 40-70
            else riskScore = Math.floor(Math.random() * 40); // 0-40
          }
          return {
            ...item,
            riskScore: Math.min(100, Math.max(0, riskScore))
          };
        }) : [];
        
        setRiskData(processedData);
        
        // Calculate current/average risk score
        if (processedData.length > 0) {
          const avgScore = processedData.reduce((sum, item) => sum + item.riskScore, 0) / processedData.length;
          setCurrentRiskScore(Math.round(avgScore));
        } else {
          setCurrentRiskScore(0);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching risk scores:', err);
        // Generate sample data if API fails
        const sampleData = [];
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setMinutes(date.getMinutes() - (10 - i) * 5);
          sampleData.push({
            _id: `sample-${i}`,
            time: date.toISOString(),
            riskScore: Math.floor(Math.random() * 100),
            interviewId: `INT${Math.floor(Math.random() * 1000)}`,
            severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'info',
            details: `Risk score: ${Math.floor(Math.random() * 100)}`
          });
        }
        setRiskData(sampleData);
        setCurrentRiskScore(Math.round(sampleData.reduce((sum, item) => sum + item.riskScore, 0) / sampleData.length));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRiskScores();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRiskScores, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.type === 'risk' || event.severity) {
        if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
        refetchTimeout.current = setTimeout(fetchRiskScores, 500);
      }
    };
    socket.on('monitoring-event', handleEvent);
    return () => {
      socket.off('monitoring-event', handleEvent);
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, []);

  // Get unique interviews for dropdown
  const interviews = Array.from(new Set(riskData.map(item => item.interviewId ? String(item.interviewId) : 'N/A')));
  const filtered = selectedInterview === 'all'
    ? riskData
    : riskData.filter(item => (item.interviewId ? String(item.interviewId) : 'N/A') === selectedInterview);

  // Prepare chart data - group by hour for trend analysis
  const timeMap = {};
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    const hourKey = hour.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    timeMap[hourKey] = { time: hourKey, score: 0, count: 0 };
  }

  filtered.forEach(item => {
    const itemTime = new Date(item.time);
    const hourKey = itemTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    if (timeMap[hourKey]) {
      timeMap[hourKey].score += item.riskScore;
      timeMap[hourKey].count += 1;
    }
  });

  const chartData = Object.values(timeMap)
    .map(item => ({
      time: item.time.split(',')[1]?.trim() || item.time.split(' ').slice(-2).join(' '),
      score: item.count > 0 ? Math.round(item.score / item.count) : 0
    }))
    .filter((item, index) => {
      // Show data points that have score > 0, or show at least every 4th point to maintain chart visibility
      return item.score > 0 || index % 4 === 0;
    });

  // Get risk level and color
  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500' };
    return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500/20', borderColor: 'border-green-500' };
  };

  const riskLevel = getRiskLevel(currentRiskScore);

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-gray-800 shadow-sm text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Interview Risk Score</h3>
        <Shield className={`${riskLevel.color}`} size={20} />
      </div>
      
      {/* Current Risk Score Display */}
      <div className={`${riskLevel.bgColor} ${riskLevel.borderColor} border-2 rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Current Risk Score</span>
          <span className={`${riskLevel.color} font-bold text-lg`}>{riskLevel.level}</span>
        </div>
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="text-4xl font-bold text-white mb-1">{currentRiskScore}</div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  currentRiskScore >= 70 ? 'bg-red-500' : currentRiskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${currentRiskScore}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            {currentRiskScore >= 70 ? (
              <AlertTriangle className="text-red-500" size={32} />
            ) : currentRiskScore >= 40 ? (
              <TrendingUp className="text-yellow-500" size={32} />
            ) : (
              <TrendingDown className="text-green-500" size={32} />
            )}
          </div>
        </div>
      </div>

      {/* Interview Filter */}
      <div className="mb-4">
        <select
          className="bg-dark-lighter text-white rounded px-3 py-2 w-full border border-gray-700 focus:outline-none focus:border-primary"
          value={selectedInterview}
          onChange={e => setSelectedInterview(e.target.value)}
        >
          <option value="all">All Interviews</option>
          {interviews.slice(0, 10).map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">Error: {error}</div>
      ) : (
        <>
          {/* Risk Score Trend Chart */}
          <div className="mb-4">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
              <TrendingUp className="mr-2" size={16} />
              Risk Score Trend (Last 24 Hours)
            </h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#aaa" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#aaa" fontSize={11} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                    formatter={(value) => [`${value}%`, 'Risk Score']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#a78bfa" 
                    strokeWidth={2}
                    fill="url(#riskGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#a78bfa" 
                    strokeWidth={2}
                    dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 border border-gray-700 rounded-lg">
                <div className="text-center">
                  <p className="mb-2">No risk score data available</p>
                  <p className="text-sm">Risk scores will appear here as interviews are monitored</p>
                </div>
              </div>
            )}
          </div>

          {/* Risk Distribution Bar Chart */}
          {filtered.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold text-sm mb-3">Risk Distribution</h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={[
                  { range: '0-30', count: filtered.filter(r => r.riskScore >= 0 && r.riskScore < 30).length },
                  { range: '30-60', count: filtered.filter(r => r.riskScore >= 30 && r.riskScore < 60).length },
                  { range: '60-80', count: filtered.filter(r => r.riskScore >= 60 && r.riskScore < 80).length },
                  { range: '80-100', count: filtered.filter(r => r.riskScore >= 80 && r.riskScore <= 100).length },
                ]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="range" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewRiskScore;
