import React, { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Legend,
} from "recharts";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { API_URL, SOCKET_URL } from '../utils/config.js';

const socket = io(SOCKET_URL);

// Helper function to safely parse JSON responses
const safeJsonParse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim().startsWith('<!')) {
      throw new Error(`Server returned HTML instead of JSON. Check if backend is running at ${API_URL}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse response: ${text.substring(0, 100)}`);
    }
  }
  return response.json();
};

const ChartsSection = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetchTimeout = useRef(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [candidateStats, setCandidateStats] = useState(null);
  const [interviewerStats, setInterviewerStats] = useState([]);
  const [timeToHireData, setTimeToHireData] = useState([]);
  const [visibleWidgets, setVisibleWidgets] = useState({
    pipeline: true,
    interviewer: true,
    timeToHire: true,
    trends: true,
    passRate: true,
  });

  const handleWidgetToggle = (key) => {
    setVisibleWidgets(v => ({ ...v, [key]: !v[key] }));
  };

  const fetchAnalytics = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    
    // Fetch real interview data
    Promise.all([
      fetch(`${API_URL}/api/interviews`, {
        headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch interviews: ${res.status} ${res.statusText}`);
          }
          return safeJsonParse(res);
        })
        .catch((err) => {
          console.error('Error fetching interviews:', err);
          setError(err.message);
          return [];
        }),
      fetch(`${API_URL}/api/dashboard/stats`, {
        headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
          }
          return safeJsonParse(res);
        })
        .catch((err) => {
          console.error('Error fetching stats:', err);
          setError(err.message);
          return {};
        })
    ])
      .then(([interviews, stats]) => {
        // Process interviews for monthly data
        const monthlyMap = {};
        const currentYear = new Date().getFullYear();
        
        // Initialize last 12 months
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = monthNames[date.getMonth()];
          monthlyMap[monthKey] = 0;
        }
        
        // Count interviews by month
        if (Array.isArray(interviews)) {
          interviews.forEach(interview => {
            if (interview.createdAt) {
              const date = new Date(interview.createdAt);
              if (date.getFullYear() === currentYear || date.getFullYear() === currentYear - 1) {
                const monthKey = monthNames[date.getMonth()];
                monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
              }
            }
          });
        }
        
        // Convert to array and reverse to show oldest first
        const monthlyDataArray = Object.entries(monthlyMap)
          .map(([month, interviews]) => ({ month, interviews }))
          .reverse();
        
        setMonthlyData(monthlyDataArray);
        
        // Calculate pass rate from interviews
        if (Array.isArray(interviews) && interviews.length > 0) {
          const completedInterviews = interviews.filter(i => i.status === 'completed');
          const passedInterviews = completedInterviews.filter(i => i.result === 'passed' || i.result === 'approved');
          const passRate = completedInterviews.length > 0 
            ? Math.round((passedInterviews.length / completedInterviews.length) * 100) 
            : 0;
          
          // Calculate quarterly pass rates
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          const quarterlyDataArray = quarters.map((quarter, idx) => {
            const quarterStartMonth = idx * 3;
            const quarterInterviews = completedInterviews.filter(i => {
              if (!i.createdAt) return false;
              const date = new Date(i.createdAt);
              return date.getMonth() >= quarterStartMonth && date.getMonth() < quarterStartMonth + 3;
            });
            const quarterPassed = quarterInterviews.filter(i => i.result === 'passed' || i.result === 'approved');
            const quarterRate = quarterInterviews.length > 0 
              ? Math.round((quarterPassed.length / quarterInterviews.length) * 100) 
              : passRate; // Fallback to overall rate if no data
            return { quarter, rate: quarterRate };
          });
          
          setQuarterlyData(quarterlyDataArray.length > 0 ? quarterlyDataArray : [
            { quarter: "Q1", rate: passRate },
            { quarter: "Q2", rate: passRate },
            { quarter: "Q3", rate: passRate },
            { quarter: "Q4", rate: passRate },
          ]);
        } else {
          // Default data if no interviews
          setQuarterlyData([
            { quarter: "Q1", rate: 0 },
            { quarter: "Q2", rate: 0 },
            { quarter: "Q3", rate: 0 },
            { quarter: "Q4", rate: 0 },
          ]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const handleAnalytics = () => {
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
      refetchTimeout.current = setTimeout(fetchAnalytics, 300);
    };
    socket.on('analytics-updated', handleAnalytics);
    return () => {
      socket.off('analytics-updated', handleAnalytics);
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    fetch(`${API_URL}/api/candidates`, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch candidates: ${res.status}`);
        }
        return safeJsonParse(res);
      })
      .then(data => {
        // Count by status
        const stats = { applied: 0, interviewing: 0, offered: 0, hired: 0, rejected: 0 };
        if (Array.isArray(data)) {
          data.forEach(c => { if (stats[c.status] !== undefined) stats[c.status]++; });
        }
        setCandidateStats(stats);
      })
      .catch(err => console.error('Error fetching candidates:', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    fetch(`${API_URL}/api/interviews`, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch interviews: ${res.status}`);
        }
        return safeJsonParse(res);
      })
      .then(data => {
        // Aggregate by interviewer
        const stats = {};
        if (Array.isArray(data)) {
          data.forEach(i => {
            if (!i.interviewer) return;
            if (!stats[i.interviewer]) stats[i.interviewer] = { interviewer: i.interviewer, total: 0, completed: 0, cancelled: 0 };
            stats[i.interviewer].total++;
            if (i.status === 'completed') stats[i.interviewer].completed++;
            if (i.status === 'cancelled') stats[i.interviewer].cancelled++;
          });
        }
        setInterviewerStats(Object.values(stats));
      })
      .catch(err => {
        console.error('Error fetching interviews:', err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    fetch(`${API_URL}/api/candidates`, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch candidates: ${res.status}`);
        }
        return safeJsonParse(res);
      })
      .then(data => {
        // For each hired candidate, calculate time from createdAt to hired date (use updatedAt if status is hired)
        if (!Array.isArray(data)) {
          setTimeToHireData([]);
          return;
        }
        
        const hires = data.filter(c => c.status === 'hired');
        const monthMap = {};
        hires.forEach(c => {
          if (!c.createdAt || !c.updatedAt) return;
          const created = new Date(c.createdAt);
          const hired = new Date(c.updatedAt);
          const month = `${hired.getFullYear()}-${String(hired.getMonth() + 1).padStart(2, '0')}`;
          const days = Math.round((hired - created) / (1000 * 60 * 60 * 24));
          if (days >= 0) { // Only count valid time differences
            if (!monthMap[month]) monthMap[month] = { month, total: 0, count: 0 };
            monthMap[month].total += days;
            monthMap[month].count++;
          }
        });
        
        // If no hires, create empty data for last 6 months
        if (Object.keys(monthMap).length === 0) {
          const emptyData = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            emptyData.push({ month: monthKey, avgTime: 0 });
          }
          setTimeToHireData(emptyData);
        } else {
          const chartData = Object.values(monthMap).map(m => ({ 
            month: m.month, 
            avgTime: m.count ? Math.round(m.total / m.count) : 0 
          }));
          chartData.sort((a, b) => a.month.localeCompare(b.month));
          setTimeToHireData(chartData);
        }
      })
      .catch(err => {
        console.error('Error fetching time-to-hire data:', err);
        setTimeToHireData([]);
      });
  }, []);

  // Get unique roles and interviewers for dropdowns
  const roles = ['all', ...Array.from(new Set(monthlyData.map(d => d.role).filter(Boolean)))];
  const interviewers = ['all', ...Array.from(new Set(monthlyData.map(d => d.interviewer).filter(Boolean)))];

  // Filtered data
  const filteredMonthly = monthlyData.filter(d => {
    const roleMatch = roleFilter === 'all' || d.role === roleFilter;
    const interviewerMatch = interviewerFilter === 'all' || d.interviewer === interviewerFilter;
    const dateMatch = (!startDate || !d.date || new Date(d.date) >= startDate) && (!endDate || !d.date || new Date(d.date) <= endDate);
    return roleMatch && interviewerMatch && dateMatch;
  });
  const filteredQuarterly = quarterlyData; // (Could add similar filtering if quarterlyData has role/interviewer/date)

  // Prepare funnel data
  const funnelData = candidateStats ? [
    { stage: 'Applied', value: candidateStats.applied },
    { stage: 'Interviewing', value: candidateStats.interviewing },
    { stage: 'Offered', value: candidateStats.offered },
    { stage: 'Hired', value: candidateStats.hired },
    { stage: 'Rejected', value: candidateStats.rejected },
  ] : [];

  // Export filtered analytics as CSV
  const handleExportCSV = () => {
    const headers = ['Month', 'Interviews', 'Role', 'Interviewer', 'Date'];
    const rows = filteredMonthly.map(d => [d.month, d.interviews, d.role || '', d.interviewer || '', d.date || '']);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export chart as PNG
  const exportChartAsImage = async (id, filename) => {
    const chartDiv = document.getElementById(id);
    if (!chartDiv) return;
    const canvas = await html2canvas(chartDiv);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Download PDF report of all visible charts
  const handleDownloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;
    const chartIds = [
      visibleWidgets.pipeline && 'pipeline-chart',
      visibleWidgets.interviewer && 'interviewer-chart',
      visibleWidgets.timeToHire && 'time-to-hire-chart',
      visibleWidgets.trends && 'monthly-chart',
      visibleWidgets.passRate && 'quarterly-chart',
    ].filter(Boolean);
    for (const id of chartIds) {
      const chartDiv = document.getElementById(id);
      if (!chartDiv) continue;
      const canvas = await html2canvas(chartDiv);
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = 180;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      if (y + pdfHeight > 287) { doc.addPage(); y = 10; }
      doc.addImage(imgData, 'PNG', 15, y, pdfWidth, pdfHeight);
      y += pdfHeight + 10;
    }
    doc.save('analytics-report.pdf');
  };

  // Download Excel report of all visible charts
  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    if (visibleWidgets.pipeline && funnelData.length) {
      const ws = XLSX.utils.json_to_sheet(funnelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Candidate Pipeline');
    }
    if (visibleWidgets.interviewer && interviewerStats.length) {
      const ws = XLSX.utils.json_to_sheet(interviewerStats);
      XLSX.utils.book_append_sheet(wb, ws, 'Interviewer Performance');
    }
    if (visibleWidgets.timeToHire && timeToHireData.length) {
      const ws = XLSX.utils.json_to_sheet(timeToHireData);
      XLSX.utils.book_append_sheet(wb, ws, 'Time-to-Hire');
    }
    if (visibleWidgets.trends && filteredMonthly.length) {
      const ws = XLSX.utils.json_to_sheet(filteredMonthly);
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Trends');
    }
    if (visibleWidgets.passRate && filteredQuarterly.length) {
      const ws = XLSX.utils.json_to_sheet(filteredQuarterly);
      XLSX.utils.book_append_sheet(wb, ws, 'Quarterly Pass Rate');
    }
    XLSX.writeFile(wb, 'analytics-report.xlsx');
  };

  if (loading) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">Loading analytics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="col-span-full flex flex-wrap gap-4 mb-4 items-center">
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleDownloadPDF}>Download PDF Report</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadExcel}>Download Excel Report</button>
        {/* Widget toggles */}
        <label className="text-white text-sm flex items-center gap-1">
          <input type="checkbox" checked={visibleWidgets.pipeline} onChange={() => handleWidgetToggle('pipeline')} /> Pipeline
        </label>
        <label className="text-white text-sm flex items-center gap-1">
          <input type="checkbox" checked={visibleWidgets.interviewer} onChange={() => handleWidgetToggle('interviewer')} /> Interviewer
        </label>
        <label className="text-white text-sm flex items-center gap-1">
          <input type="checkbox" checked={visibleWidgets.timeToHire} onChange={() => handleWidgetToggle('timeToHire')} /> Time-to-Hire
        </label>
        <label className="text-white text-sm flex items-center gap-1">
          <input type="checkbox" checked={visibleWidgets.trends} onChange={() => handleWidgetToggle('trends')} /> Interview Trends
        </label>
        <label className="text-white text-sm flex items-center gap-1">
          <input type="checkbox" checked={visibleWidgets.passRate} onChange={() => handleWidgetToggle('passRate')} /> Pass Rate
        </label>
        <label className="text-white text-sm">
          Role:
          <select className="ml-2 p-1 rounded bg-dark-lighter text-white border border-gray-700" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-white text-sm">
          Interviewer:
          <select className="ml-2 p-1 rounded bg-dark-lighter text-white border border-gray-700" value={interviewerFilter} onChange={e => setInterviewerFilter(e.target.value)}>
            {interviewers.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        <label className="text-white text-sm flex items-center gap-2">
          Date Range:
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={update => setDateRange(update)}
            isClearable
            className="p-1 rounded bg-dark-lighter text-white border border-gray-700"
            placeholderText="Select range"
          />
        </label>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportCSV}>Export CSV</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => exportChartAsImage('monthly-chart', 'monthly-analytics.png')}>Download Monthly Chart</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => exportChartAsImage('quarterly-chart', 'quarterly-analytics.png')}>Download Quarterly Chart</button>
      </div>
      {/* Candidate Pipeline Funnel */}
      {visibleWidgets.pipeline && (
        <div id="pipeline-chart" className="col-span-full bg-dark-card rounded-lg p-6 border border-border-color mb-6">
          <h3 className="text-lg font-semibold mb-2">Candidate Pipeline</h3>
          <p className="text-gray-text text-sm mb-6">Funnel of candidates by stage</p>
          <div className="h-64 flex items-center justify-center">
            {candidateStats ? (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart width={400} height={250}>
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                    stroke="#6A5ACD"
                    fill="#6A5ACD"
                  >
                    <LabelList dataKey="stage" position="right" fill="#fff" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">Loading pipeline...</div>
            )}
          </div>
        </div>
      )}
      {/* Interviewer Performance */}
      {visibleWidgets.interviewer && (
        <div id="interviewer-chart" className="col-span-full bg-dark-card rounded-lg p-6 border border-border-color mb-6">
          <h3 className="text-lg font-semibold mb-2">Interviewer Performance</h3>
          <p className="text-gray-text text-sm mb-6">Number of interviews conducted by each interviewer (completed/cancelled)</p>
          <div className="h-64 flex items-center justify-center">
            {interviewerStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewerStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="interviewer" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="completed" fill="#34d399" name="Completed" />
                  <Bar dataKey="cancelled" fill="#f87171" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">Loading interviewer stats...</div>
            )}
          </div>
        </div>
      )}
      {/* Time-to-Hire Trends */}
      {visibleWidgets.timeToHire && (
        <div id="time-to-hire-chart" className="col-span-full bg-dark-card rounded-lg p-6 border border-gray-800 mb-6">
          <h3 className="text-lg font-semibold mb-2 text-white">Time-to-Hire Trends</h3>
          <p className="text-gray-400 text-sm mb-6">Average days from application to hire per month</p>
          <div className="h-64">
            {timeToHireData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeToHireData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#aaa" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#aaa" fontSize={12} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }} 
                    formatter={(value) => [`${value} days`, 'Avg Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#fbbf24" 
                    strokeWidth={3} 
                    dot={{ stroke: '#fbbf24', strokeWidth: 2, r: 4, fill: '#fbbf24' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="mb-2">No hiring data available</p>
                  <p className="text-sm">Time-to-hire trends will appear here when candidates are hired</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Interviews Over Time */}
      {visibleWidgets.trends && (
        <div id="monthly-chart" className="bg-dark-card rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Interviews Over Time</h3>
          <p className="text-gray-400 text-sm mb-6">Monthly interview count trends</p>
          <div className="h-64">
            {filteredMonthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredMonthly}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }} 
                    formatter={(value) => [`${value} interviews`, 'Count']}
                  />
                  <Line
                    type="monotone"
                    dataKey="interviews"
                    stroke="#6A5ACD"
                    strokeWidth={3}
                    dot={{ stroke: '#6A5ACD', strokeWidth: 2, r: 4, fill: '#6A5ACD' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="mb-2">No interview data available</p>
                  <p className="text-sm">Interview trends will appear here when interviews are scheduled</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Interview Pass Rate */}
      {visibleWidgets.passRate && (
        <div id="quarterly-chart" className="bg-dark-card rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Interview Pass Rate</h3>
          <p className="text-gray-400 text-sm mb-6">Quarterly pass rate percentage</p>
          <div className="h-64">
            {filteredQuarterly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredQuarterly}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="quarter" stroke="#aaa" fontSize={12} />
                  <YAxis 
                    stroke="#aaa" 
                    fontSize={12} 
                    domain={[0, 100]}
                    label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft', fill: '#aaa' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }} 
                    formatter={(value) => [`${value}%`, 'Pass Rate']}
                  />
                  <Bar dataKey="rate" fill="#6A5ACD" radius={[10, 10, 0, 0]}>
                    <LabelList dataKey="rate" position="top" fill="#fff" fontSize={12} formatter={(value) => `${value}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="mb-2">No pass rate data available</p>
                  <p className="text-sm">Pass rates will appear here when interviews are completed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
