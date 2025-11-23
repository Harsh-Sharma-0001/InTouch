import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LabelList } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const socket = io('http://localhost:5000'); // Adjust port if needed

const getToken = () => {
  // Try both 'token' and 'userToken' for backward compatibility
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', questions: [''] });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logAdminFilter, setLogAdminFilter] = useState('all');
  const [logDateRange, setLogDateRange] = useState([null, null]);
  const [logStartDate, logEndDate] = logDateRange;

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTemplates(filteredTemplates.map((t) => t._id));
    } else {
      setSelectedTemplates([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTemplates.length} templates?`)) return;
    setSubmitting(true);
    try {
      for (const templateId of selectedTemplates) {
        await fetch(`http://localhost:5000/api/templates/${templateId}`, {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        socket.emit('template-deleted');
      }
      setSelectedTemplates([]);
      fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTemplates = () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }
    
    fetch('http://localhost:5000/api/templates', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        console.log('📡 Templates API response status:', res.status);
        if (res.status === 401) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 401 Unauthorized:', errorData);
          throw new Error('Authentication failed. Please log out and log in again as admin.');
        }
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 403 Forbidden:', errorData);
          throw new Error('Access denied. Admin privileges required. Please ensure your account has admin access.');
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ Error response:', errorData);
          throw new Error(errorData.message || `Failed to fetch templates (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Templates fetched successfully:', data.length, 'templates');
        setTemplates(data);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching templates:', err);
        setError(err.message || 'Failed to fetch templates');
        setLoading(false);
      });
  };

  const fetchAuditLogs = () => {
    setLoadingLogs(true);
    const token = getToken();
    if (!token) {
      setLogsError('No authentication token found. Please log in.');
      setLoadingLogs(false);
      return;
    }
    fetch('http://localhost:5000/api/templates/audit-logs', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        console.log('📡 Template audit logs API response status:', res.status);
        if (res.status === 401) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 401 Unauthorized:', errorData);
          throw new Error('Authentication failed. Please log out and log in again as admin.');
        }
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 403 Forbidden:', errorData);
          throw new Error('Access denied. Admin privileges required. Please ensure your account has admin access.');
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ Error response:', errorData);
          throw new Error(errorData.message || `Failed to fetch audit logs (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Template audit logs fetched successfully:', data.length, 'logs');
        setAuditLogs(data);
        setLoadingLogs(false);
        setLogsError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching template audit logs:', err);
        setLogsError(err.message || 'Failed to fetch audit logs');
        setLoadingLogs(false);
      });
  };

  useEffect(() => {
    // Check token and admin status on mount
    const token = getToken();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    console.log('🔍 TemplateManagement mounted');
    console.log('🔑 Token exists:', !!token);
    console.log('👑 Admin status in localStorage:', isAdmin);
    
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }
    
    if (!isAdmin) {
      console.warn('⚠️ User is not marked as admin in localStorage');
    }
    
    fetchTemplates();
    fetchAuditLogs();
    
    // Real-time updates
    const handleCreated = () => fetchTemplates();
    const handleUpdated = () => fetchTemplates();
    const handleDeleted = () => fetchTemplates();
    socket.on('template-created', handleCreated);
    socket.on('template-updated', handleUpdated);
    socket.on('template-deleted', handleDeleted);
    return () => {
      socket.off('template-created', handleCreated);
      socket.off('template-updated', handleUpdated);
      socket.off('template-deleted', handleDeleted);
    };
  }, []);

  const openModal = (template = null) => {
    setEditTemplate(template);
    setForm(
      template
        ? { name: template.name, description: template.description, questions: template.questions.length ? template.questions : [''] }
        : { name: '', description: '', questions: [''] }
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTemplate(null);
    setError(null);
  };

  const handleFormChange = (e, idx = null) => {
    const { name, value } = e.target;
    if (name === 'questions' && idx !== null) {
      setForm(f => {
        const q = [...f.questions];
        q[idx] = value;
        return { ...f, questions: q };
      });
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, ''] }));
  const removeQuestion = idx => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editTemplate ? 'PUT' : 'POST';
      const url = editTemplate ? `http://localhost:5000/api/templates/${editTemplate._id}` : 'http://localhost:5000/api/templates';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save template');
      closeModal();
      fetchTemplates();
      socket.emit(editTemplate ? 'template-updated' : 'template-created');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/templates/${template._id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to delete template');
      fetchTemplates();
      socket.emit('template-deleted');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered templates
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  // Export templates as CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Description', 'Questions'];
    const rows = filteredTemplates.map(t => [
      t.name.replace(/,/g, ' '),
      t.description.replace(/,/g, ' '),
      t.questions.map(q => q.replace(/,/g, ' ')).join('|')
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import templates from CSV
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [header, ...rows] = lines;
      for (const row of rows) {
        const [name, description, questions] = row.split(',');
        if (!name) continue;
        await fetch('http://localhost:5000/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            name,
            description,
            questions: questions ? questions.split('|').map(q => q.trim()).filter(Boolean) : []
          })
        });
      }
      fetchTemplates();
    } catch (err) {
      setImportError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Filtered audit logs for analytics
  const filteredLogs = auditLogs.filter(log => {
    const actionMatch = logActionFilter === 'all' || log.action === logActionFilter;
    const adminMatch = logAdminFilter === 'all' || log.admin === logAdminFilter;
    const dateMatch = (!logStartDate || new Date(log.time) >= logStartDate) && (!logEndDate || new Date(log.time) <= logEndDate);
    return actionMatch && adminMatch && dateMatch;
  });
  // Actions per day (for bar chart) - Get last 30 days
  const actionsPerDay = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Initialize last 30 days with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    actionsPerDay[dayKey] = 0;
  }
  
  // Fill with actual data
  filteredLogs.forEach(log => {
    const logDate = new Date(log.time);
    if (logDate >= thirtyDaysAgo) {
      const dayKey = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      actionsPerDay[dayKey] = (actionsPerDay[dayKey] || 0) + 1;
    }
  });
  
  // Convert to array and sort by date (keep track of actual dates for sorting)
  const actionsPerDayData = Object.entries(actionsPerDay)
    .map(([day, count]) => {
      // Parse the day string to get actual date for sorting
      const parts = day.split(' ');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(parts[0]);
      const dayNum = parseInt(parts[1]);
      const currentDate = new Date();
      const date = new Date(currentDate.getFullYear(), monthIndex, dayNum);
      return { day, count, date };
    })
    .sort((a, b) => a.date - b.date)
    .map(({ day, count }) => ({ day, count }))
    .slice(-14); // Show last 14 days for better visualization
  
  // Action type distribution (for pie chart)
  const actionTypeCounts = {};
  filteredLogs.forEach(log => {
    const action = log.action || 'unknown';
    actionTypeCounts[action] = (actionTypeCounts[action] || 0) + 1;
  });
  const actionTypeData = Object.entries(actionTypeCounts)
    .map(([action, value]) => ({ 
      action: action.charAt(0).toUpperCase() + action.slice(1), 
      value 
    }))
    .sort((a, b) => b.value - a.value);
  
  // If no data, add placeholder
  if (actionTypeData.length === 0) {
    actionTypeData.push({ action: 'No Actions', value: 1 });
  }
  
  // Template creation trends (for line chart) - Get last 12 months
  const creationTrends = {};
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  // Initialize last 12 months with 0
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    creationTrends[monthKey] = 0;
  }
  
  // Fill with actual data
  filteredLogs.filter(log => log.action === 'create').forEach(log => {
    const logDate = new Date(log.time);
    if (logDate >= twelveMonthsAgo) {
      const monthKey = logDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      creationTrends[monthKey] = (creationTrends[monthKey] || 0) + 1;
    }
  });
  
  // Convert to array and sort by date
  const creationTrendsData = Object.entries(creationTrends)
    .map(([month, count]) => {
      // Parse month string (e.g., "Jan 2024") to date for sorting
      const parts = month.split(' ');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(parts[0]);
      const year = parseInt(parts[1]);
      const date = new Date(year, monthIndex, 1);
      return { month, count, date };
    })
    .sort((a, b) => a.date - b.date)
    .map(({ month, count }) => ({ month, count }));
  const adminOptions = ['all', ...Array.from(new Set(auditLogs.map(l => l.admin).filter(Boolean)))];
  const actionOptions = ['all', ...Array.from(new Set(auditLogs.map(l => l.action).filter(Boolean)))];

  // Export template analytics as CSV
  const handleExportTemplateAnalyticsCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Templates', templates.length],
      ['Templates Created', filteredLogs.filter(l => l.action === 'create').length],
      ['Templates Updated', filteredLogs.filter(l => l.action === 'update').length],
      ['Templates Deleted', filteredLogs.filter(l => l.action === 'delete').length],
      ['Actions Last 30 Days', filteredLogs.filter(l => new Date(l.time) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length]
    ];
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export template analytics as Excel
  const handleExportTemplateAnalyticsExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Template actions per day
    const ws1 = XLSX.utils.json_to_sheet(actionsPerDayData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Actions Per Day');
    
    // Action type distribution
    const ws2 = XLSX.utils.json_to_sheet(actionTypeData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Action Distribution');
    
    // Template creation trends
    const ws3 = XLSX.utils.json_to_sheet(creationTrendsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Creation Trends');
    
    // Template list
    const templateListData = templates.map(t => ({
      name: t.name,
      description: t.description,
      questions: t.questions.length,
      createdBy: t.createdBy || 'Unknown'
    }));
    const ws4 = XLSX.utils.json_to_sheet(templateListData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Template List');
    
    XLSX.writeFile(wb, 'template-analytics.xlsx');
  };

  // Download template analytics PDF
  const handleDownloadTemplateAnalyticsPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Template Analytics Report', 15, y);
    y += 15;
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Total Templates: ${templates.length}`, 15, y);
    y += 5;
    doc.text(`Templates Created: ${filteredLogs.filter(l => l.action === 'create').length}`, 15, y);
    y += 5;
    doc.text(`Templates Updated: ${filteredLogs.filter(l => l.action === 'update').length}`, 15, y);
    y += 5;
    doc.text(`Templates Deleted: ${filteredLogs.filter(l => l.action === 'delete').length}`, 15, y);
    y += 15;
    
    // Capture charts
    const chartIds = ['template-actions-chart', 'template-distribution-chart', 'template-trends-chart'];
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
    
    doc.save('template-analytics-report.pdf');
  };

  if (loading) return <div className="bg-dark-card rounded-lg p-6 mb-6">Loading templates...</div>;
  if (error) return <div className="bg-dark-card rounded-lg p-6 mb-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Interview Templates</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or description"
            className="p-2 rounded bg-dark-lighter text-white border border-gray-700"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-primary text-white px-4 py-2 rounded" onClick={() => openModal()}>New Template</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportCSV}>Export CSV</button>
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} disabled={importing} />
          </label>
          {importing && <span className="text-yellow-400 ml-2">Importing...</span>}
          {importError && <span className="text-red-500 ml-2">{importError}</span>}
        </div>
      </div>
      <div className="overflow-x-auto">
        {selectedTemplates.length > 0 && (
          <button className="bg-red-600 text-white px-3 py-2 rounded mb-2" onClick={handleBulkDelete} disabled={submitting}>
            Delete Selected
          </button>
        )}
        <table className="min-w-full bg-dark-lighter rounded-lg">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 px-4">
                <input
                  type="checkbox"
                  checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                  onChange={e => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Questions</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(template => (
              <tr key={template._id} className="border-b border-gray-700 hover:bg-dark-card transition-colors">
                <td className="py-2 px-4">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template._id)}
                    onChange={() => handleSelectTemplate(template._id)}
                  />
                </td>
                <td className="py-2 px-4 text-white">{template.name}</td>
                <td className="py-2 px-4 text-white">{template.description}</td>
                <td className="py-2 px-4 text-white">
                  <ul className="list-disc ml-4">
                    {template.questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </td>
                <td className="py-2 px-4">
                  <button className="text-primary mr-2" onClick={() => openModal(template)}>Edit</button>
                  <button className="text-red-500" onClick={() => handleDelete(template)} disabled={submitting}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white mt-10">Template Audit Log Analytics</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleExportTemplateAnalyticsCSV}>Export Template Analytics CSV</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportTemplateAnalyticsExcel}>Export Template Analytics Excel</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleDownloadTemplateAnalyticsPDF}>Download Template Analytics PDF</button>
        <label className="text-white text-sm flex items-center gap-1">
          Action:
          <select className="ml-2 p-1 rounded bg-dark-lighter text-white border border-gray-700" value={logActionFilter} onChange={e => setLogActionFilter(e.target.value)}>
            {actionOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="text-white text-sm flex items-center gap-1">
          Admin:
          <select className="ml-2 p-1 rounded bg-dark-lighter text-white border border-gray-700" value={logAdminFilter} onChange={e => setLogAdminFilter(e.target.value)}>
            {adminOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="text-white text-sm flex items-center gap-2">
          Date Range:
          <DatePicker
            selectsRange
            startDate={logStartDate}
            endDate={logEndDate}
            onChange={update => setLogDateRange(update)}
            isClearable
            className="ml-2 p-1 rounded bg-dark-lighter text-white border border-gray-700"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Template Actions Per Day */}
        <div id="template-actions-chart" className="bg-dark-card rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Template Actions Per Day</h3>
          <p className="text-gray-400 text-sm mb-4">Last 14 days of template actions</p>
          {actionsPerDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={actionsPerDayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="day" 
                  stroke="#aaa" 
                  fontSize={11} 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                />
                <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }} 
                />
                <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" fill="#fff" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No actions in the last 30 days</p>
                <p className="text-sm">Template actions will appear here</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Type Distribution */}
        <div id="template-distribution-chart" className="bg-dark-card rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Action Type Distribution</h3>
          <p className="text-gray-400 text-sm mb-4">Distribution of template actions</p>
          {actionTypeData.length > 0 && actionTypeData[0].value > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={actionTypeData} 
                  dataKey="value" 
                  nameKey="action" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={70} 
                  label={(entry) => `${entry.action}: ${entry.value}`}
                >
                  {actionTypeData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={["#22d3ee", "#8b5cf6", "#f59e42", "#ef4444", "#10b981", "#3b82f6"][idx % 6]} 
                    />
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
                  wrapperStyle={{ fontSize: '12px', color: '#aaa' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No actions recorded</p>
                <p className="text-sm">Action distribution will appear here</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Template Creation Trends */}
        <div id="template-trends-chart" className="bg-dark-card rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-white">Template Creation Trends</h3>
          <p className="text-gray-400 text-sm mb-4">Template creation over last 12 months</p>
          {creationTrendsData.length > 0 && creationTrendsData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={creationTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="month" 
                  stroke="#aaa" 
                  fontSize={11} 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                />
                <YAxis stroke="#aaa" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e42" 
                  strokeWidth={3} 
                  dot={{ fill: '#f59e42', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No templates created yet</p>
                <p className="text-sm">Creation trends will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white mt-10">Template Audit Log</h2>
      {loadingLogs ? (
        <div className="p-4 text-gray-400">Loading audit logs...</div>
      ) : logsError ? (
        <div className="p-4 text-red-500">Error: {logsError}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-lighter rounded-lg">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 px-4">Action</th>
                <th className="py-2 px-4">Admin</th>
                <th className="py-2 px-4">Target</th>
                <th className="py-2 px-4">Details</th>
                <th className="py-2 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log._id} className="border-b border-gray-700">
                  <td className="py-2 px-4 text-white">{log.action}</td>
                  <td className="py-2 px-4 text-white">{log.admin}</td>
                  <td className="py-2 px-4 text-white">{log.target}</td>
                  <td className="py-2 px-4 text-white">{log.details}</td>
                  <td className="py-2 px-4 text-white">{new Date(log.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeModal}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">{editTemplate ? 'Edit Template' : 'New Template'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" value={form.name} onChange={handleFormChange} required placeholder="Template Name" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <div>
                <label className="text-white font-medium">Questions:</label>
                {form.questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      name="questions"
                      value={q}
                      onChange={e => handleFormChange(e, idx)}
                      required
                      placeholder={`Question ${idx + 1}`}
                      className="flex-1 p-2 rounded bg-dark-lighter text-white"
                    />
                    {form.questions.length > 1 && (
                      <button type="button" className="text-red-500" onClick={() => removeQuestion(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="text-primary mt-2" onClick={addQuestion}>Add Question</button>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded mt-2" disabled={submitting}>{submitting ? (editTemplate ? 'Saving...' : 'Creating...') : (editTemplate ? 'Save' : 'Create')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement; 