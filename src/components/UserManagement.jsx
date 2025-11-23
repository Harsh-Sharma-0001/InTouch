import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', isAdmin: false });
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [logAdminFilter, setLogAdminFilter] = useState('all');
  const [logDateRange, setLogDateRange] = useState([null, null]);
  const [logStartDate, logEndDate] = logDateRange;

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} users?`)) return;
    setSubmitting(true);
    try {
      for (const userId of selectedUsers) {
        await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        socket.emit('user-deleted', userId);
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkToggleAdmin = async () => {
    setSubmitting(true);
    try {
      for (const userId of selectedUsers) {
        const user = users.find((u) => u._id === userId);
        if (!user) continue;
        await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ ...user, isAdmin: !user.isAdmin }),
        });
        socket.emit('user-updated', { ...user, isAdmin: !user.isAdmin });
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }
    
    console.log('🔑 Fetching users with token:', token.substring(0, 20) + '...');
    
    fetch('http://localhost:5000/api/auth/users', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        console.log('📡 Users API response status:', res.status);
        if (res.status === 401) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 401 Unauthorized:', errorData);
          throw new Error('Authentication failed. Please log out and log in again as admin.');
        }
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ 403 Forbidden:', errorData);
          throw new Error('Access denied. Admin privileges required. Please ensure your account has admin access and try logging in again.');
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('❌ Error response:', errorData);
          throw new Error(errorData.message || `Failed to fetch users (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Users fetched successfully:', data.length, 'users');
        setUsers(data);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
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
    fetch('http://localhost:5000/api/auth/audit-logs', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        console.log('📡 Audit logs API response status:', res.status);
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
        console.log('✅ Audit logs fetched successfully:', data.length, 'logs');
        setAuditLogs(data);
        setLoadingLogs(false);
        setLogsError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching audit logs:', err);
        setLogsError(err.message || 'Failed to fetch audit logs');
        setLoadingLogs(false);
      });
  };

  useEffect(() => {
    // Check token and admin status on mount
    const token = getToken();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    console.log('🔍 UserManagement mounted');
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
    
    fetchUsers();
    fetchAuditLogs();
    
    // Real-time updates
    const handleUserCreated = (user) => fetchUsers();
    const handleUserUpdated = (user) => fetchUsers();
    const handleUserDeleted = (userId) => fetchUsers();
    socket.on('user-created', handleUserCreated);
    socket.on('user-updated', handleUserUpdated);
    socket.on('user-deleted', handleUserDeleted);
    return () => {
      socket.off('user-created', handleUserCreated);
      socket.off('user-updated', handleUserUpdated);
      socket.off('user-deleted', handleUserDeleted);
    };
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, isAdmin: user.isAdmin });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${editUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update user');
      setEditUser(null);
      // Emit real-time event
      socket.emit('user-updated', { ...editUser, ...editForm });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${user._id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      // Emit real-time event
      socket.emit('user-deleted', user._id);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(createForm)
      });
      if (!res.ok) throw new Error('Failed to create user');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', isAdmin: false });
      // Emit real-time event
      socket.emit('user-created', createForm);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Export users as CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Admin'];
    const rows = filteredUsers.map(u => [u.name, u.email, u.isAdmin ? 'Yes' : 'No']);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import users from CSV
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
        const [name, email, admin] = row.split(',');
        if (!name || !email) continue;
        await fetch('http://localhost:5000/api/auth/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ name, email, password: 'changeme123', isAdmin: admin?.toLowerCase().startsWith('y') })
        });
      }
      fetchUsers();
    } catch (err) {
      setImportError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesAdmin =
      adminFilter === "all" ||
      (adminFilter === "admin" && user.isAdmin) ||
      (adminFilter === "user" && !user.isAdmin);
    return matchesSearch && matchesAdmin;
  });

  // Filtered audit logs for analytics
  const filteredLogs = auditLogs.filter(log => {
    const actionMatch = logActionFilter === 'all' || log.action === logActionFilter;
    const adminMatch = logAdminFilter === 'all' || log.admin === logAdminFilter;
    const dateMatch = (!logStartDate || new Date(log.time) >= logStartDate) && (!logEndDate || new Date(log.time) <= logEndDate);
    return actionMatch && adminMatch && dateMatch;
  });
  // Actions per day (for bar/line chart)
  const actionsPerDay = {};
  filteredLogs.forEach(log => {
    const day = new Date(log.time).toLocaleDateString();
    actionsPerDay[day] = (actionsPerDay[day] || 0) + 1;
  });
  const actionsPerDayData = Object.entries(actionsPerDay).map(([day, count]) => ({ day, count }));
  // Action type distribution (for pie chart)
  const actionTypeCounts = {};
  filteredLogs.forEach(log => {
    actionTypeCounts[log.action] = (actionTypeCounts[log.action] || 0) + 1;
  });
  const actionTypeData = Object.entries(actionTypeCounts).map(([action, value]) => ({ action, value }));
  const adminOptions = ['all', ...Array.from(new Set(auditLogs.map(l => l.admin).filter(Boolean)))];
  const actionOptions = ['all', ...Array.from(new Set(auditLogs.map(l => l.action).filter(Boolean)))];

  // User growth analytics
  const userGrowthData = users.map(user => {
    const createdDate = new Date(user.createdAt || Date.now());
    return {
      date: createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      timestamp: createdDate.getTime()
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
  
  // Group by month and count cumulative users
  const growthByMonth = {};
  let cumulativeCount = 0;
  userGrowthData.forEach(user => {
    cumulativeCount++;
    growthByMonth[user.date] = cumulativeCount;
  });
  const userGrowthChartData = Object.entries(growthByMonth).map(([date, count]) => ({ date, count }));
  
  // Admin vs regular user ratio
  const adminCount = users.filter(u => u.isAdmin).length;
  const regularCount = users.filter(u => !u.isAdmin).length;
  const userRoleData = [
    { role: 'Admin', count: adminCount },
    { role: 'Regular User', count: regularCount }
  ];
  
  // User activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = users.filter(u => new Date(u.createdAt || Date.now()) >= thirtyDaysAgo);
  const activityData = [
    { period: 'Last 30 Days', count: recentUsers.length },
    { period: 'Total Users', count: users.length }
  ];

  // Export user analytics as CSV
  const handleExportUserAnalyticsCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Users', users.length],
      ['Admin Users', adminCount],
      ['Regular Users', regularCount],
      ['Users Last 30 Days', recentUsers.length],
      ['Admin Percentage', `${((adminCount / users.length) * 100).toFixed(1)}%`],
      ['Growth Rate', `${((recentUsers.length / users.length) * 100).toFixed(1)}%`]
    ];
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export user analytics as Excel
  const handleExportUserAnalyticsExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // User growth data
    const ws1 = XLSX.utils.json_to_sheet(userGrowthChartData);
    XLSX.utils.book_append_sheet(wb, ws1, 'User Growth');
    
    // User role data
    const ws2 = XLSX.utils.json_to_sheet(userRoleData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Role Distribution');
    
    // User activity data
    const ws3 = XLSX.utils.json_to_sheet(activityData);
    XLSX.utils.book_append_sheet(wb, ws3, 'User Activity');
    
    // User list
    const userListData = users.map(u => ({
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin ? 'Yes' : 'No',
      createdAt: new Date(u.createdAt || Date.now()).toLocaleDateString()
    }));
    const ws4 = XLSX.utils.json_to_sheet(userListData);
    XLSX.utils.book_append_sheet(wb, ws4, 'User List');
    
    XLSX.writeFile(wb, 'user-analytics.xlsx');
  };

  // Download user analytics PDF
  const handleDownloadUserAnalyticsPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;
    
    // Add title
    doc.setFontSize(20);
    doc.text('User Analytics Report', 15, y);
    y += 15;
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Total Users: ${users.length}`, 15, y);
    y += 5;
    doc.text(`Admin Users: ${adminCount}`, 15, y);
    y += 5;
    doc.text(`Regular Users: ${regularCount}`, 15, y);
    y += 5;
    doc.text(`Users Last 30 Days: ${recentUsers.length}`, 15, y);
    y += 15;
    
    // Capture charts
    const chartIds = ['user-growth-chart', 'user-role-chart', 'user-activity-chart'];
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
    
    doc.save('user-analytics-report.pdf');
  };

  if (loading) return <div className="bg-dark-card rounded-lg p-6 mb-6">Loading users...</div>;
  if (error) return <div className="bg-dark-card rounded-lg p-6 mb-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <button className="bg-primary text-white px-4 py-2 rounded" onClick={() => setShowCreateModal(true)}>Create User</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportCSV}>Export CSV</button>
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} disabled={importing} />
        </label>
        {importing && <span className="text-yellow-400 ml-2">Importing...</span>}
        {importError && <span className="text-red-500 ml-2">{importError}</span>}
        <input
          type="text"
          placeholder="Search by name or email"
          className="p-2 rounded bg-dark-lighter text-white border border-gray-700 md:ml-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="p-2 rounded bg-dark-lighter text-white border border-gray-700 md:ml-2"
          value={adminFilter}
          onChange={e => setAdminFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
        {selectedUsers.length > 0 && (
          <>
            <button className="bg-red-600 text-white px-3 py-2 rounded ml-2" onClick={handleBulkDelete} disabled={submitting}>
              Delete Selected
            </button>
            <button className="bg-blue-600 text-white px-3 py-2 rounded ml-2" onClick={handleBulkToggleAdmin} disabled={submitting}>
              Toggle Admin
            </button>
          </>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-dark-lighter rounded-lg">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 px-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={e => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Admin</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="border-b border-gray-700 hover:bg-dark-card transition-colors">
                <td className="py-2 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </td>
                <td className="py-2 px-4 text-white">{user.name}</td>
                <td className="py-2 px-4 text-white">{user.email}</td>
                <td className="py-2 px-4 text-white">{user.isAdmin ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4">
                  <button className="text-primary mr-2" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="text-red-500" onClick={() => handleDelete(user)} disabled={submitting}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowCreateModal(false)}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">Create User</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <input name="name" value={createForm.name} onChange={handleCreateChange} required placeholder="Name" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="email" value={createForm.email} onChange={handleCreateChange} required placeholder="Email" className="w-full p-2 rounded bg-dark-lighter text-white" type="email" />
              <input name="password" value={createForm.password} onChange={handleCreateChange} required placeholder="Password" className="w-full p-2 rounded bg-dark-lighter text-white" type="password" />
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" name="isAdmin" checked={createForm.isAdmin} onChange={handleCreateChange} />
                Admin
              </label>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded mt-2" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setEditUser(null)}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input name="name" value={editForm.name} onChange={handleEditChange} required placeholder="Name" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="email" value={editForm.email} onChange={handleEditChange} required placeholder="Email" className="w-full p-2 rounded bg-dark-lighter text-white" type="email" />
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" name="isAdmin" checked={editForm.isAdmin} onChange={handleEditChange} />
                Admin
              </label>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded mt-2" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </form>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4 text-white mt-10">Audit Log Analytics</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
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
      <h2 className="text-xl font-semibold mb-4 text-white mt-10">User Analytics</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleExportUserAnalyticsCSV}>Export User Analytics CSV</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportUserAnalyticsExcel}>Export User Analytics Excel</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleDownloadUserAnalyticsPDF}>Download User Analytics PDF</button>
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
        <div id="user-growth-chart" className="bg-dark-card rounded-lg p-6 border border-border-color">
          <h3 className="text-lg font-semibold mb-2 text-white">User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowthChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
              <YAxis stroke="#aaa" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div id="user-role-chart" className="bg-dark-card rounded-lg p-6 border border-border-color">
          <h3 className="text-lg font-semibold mb-2 text-white">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={userRoleData} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={70} label>
                {userRoleData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={["#10b981", "#3b82f6"][idx % 2]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div id="user-activity-chart" className="bg-dark-card rounded-lg p-6 border border-border-color">
          <h3 className="text-lg font-semibold mb-2 text-white">User Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="period" stroke="#aaa" fontSize={12} />
              <YAxis stroke="#aaa" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white mt-10">Audit Log</h2>
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
              {auditLogs.map(log => (
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
    </div>
  );
};

export default UserManagement; 