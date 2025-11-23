import React, { useState } from 'react'
import { CalendarPlus, Users, Edit, Settings, X, FileText, BarChart3, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate();
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showSystemSettingsModal, setShowSystemSettingsModal] = useState(false);
  const [form, setForm] = useState({
    candidate: '',
    role: '',
    time: '',
    type: '',
    platform: '',
    interviewer: ''
  });
  const [systemSettings, setSystemSettings] = useState({
    autoRecording: true,
    monitoringEnabled: true,
    notificationsEnabled: true,
    maxParticipants: 10,
    sessionTimeout: 60
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const actions = [
    {
      label: 'Schedule New Interview',
      icon: CalendarPlus,
      onClick: () => setShowInterviewModal(true)
    },
    {
      label: 'Manage Users',
      icon: Users,
      onClick: () => navigate('/admin') // Navigate to admin panel where UserManagement is available
    },
    {
      label: 'Review Interview Guides',
      icon: Edit,
      onClick: () => navigate('/admin') // Navigate to admin panel where TemplateManagement is available
    },
    {
      label: 'System Settings',
      icon: Settings,
      onClick: () => setShowSystemSettingsModal(true)
    }
  ];

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to schedule interview');
      setSuccess('Interview scheduled successfully!');
      setForm({ candidate: '', role: '', time: '', type: '', platform: '', interviewer: '' });
      setTimeout(() => setShowInterviewModal(false), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSubmitting(true);
    try {
      // In a real app, you'd save these to the backend
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      setSuccess('Settings saved successfully!');
      setTimeout(() => setShowSystemSettingsModal(false), 1500);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-border-color">
      <h3 className="text-lg font-semibold mb-2 text-white">Quick Actions</h3>
      <p className="text-gray-text text-sm mb-6">Access essential administrative functionalities quickly.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex items-center space-x-3 p-4 bg-dark-lighter rounded-lg text-white hover:bg-gray-700 transition-colors text-left"
            onClick={action.onClick}
          >
            <action.icon size={20} className="text-primary" />
            <span className="font-medium text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Schedule New Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowInterviewModal(false)}>
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">Schedule New Interview</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input 
                name="candidate" 
                value={form.candidate} 
                onChange={handleFormChange} 
                required 
                placeholder="Candidate Name" 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600" 
              />
              <input 
                name="role" 
                value={form.role} 
                onChange={handleFormChange} 
                required 
                placeholder="Role" 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600" 
              />
              <input 
                name="time" 
                value={form.time} 
                onChange={handleFormChange} 
                required 
                placeholder="Time" 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600" 
                type="datetime-local" 
              />
              <select 
                name="type" 
                value={form.type} 
                onChange={handleFormChange} 
                required 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600"
              >
                <option value="">Select Type</option>
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
              </select>
              <input 
                name="platform" 
                value={form.platform} 
                onChange={handleFormChange} 
                required 
                placeholder="Platform (e.g. Google Meet)" 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600" 
              />
              <input 
                name="interviewer" 
                value={form.interviewer} 
                onChange={handleFormChange} 
                required 
                placeholder="Interviewer" 
                className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600" 
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-2 rounded mt-2 disabled:opacity-50" 
                disabled={submitting}
              >
                {submitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {showSystemSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowSystemSettingsModal(false)}>
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Auto Recording</label>
                <input 
                  type="checkbox" 
                  name="autoRecording"
                  checked={systemSettings.autoRecording}
                  onChange={handleSettingsChange}
                  className="w-4 h-4 text-primary bg-dark-lighter border-gray-600 rounded focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Monitoring Enabled</label>
                <input 
                  type="checkbox" 
                  name="monitoringEnabled"
                  checked={systemSettings.monitoringEnabled}
                  onChange={handleSettingsChange}
                  className="w-4 h-4 text-primary bg-dark-lighter border-gray-600 rounded focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white text-sm">Notifications</label>
                <input 
                  type="checkbox" 
                  name="notificationsEnabled"
                  checked={systemSettings.notificationsEnabled}
                  onChange={handleSettingsChange}
                  className="w-4 h-4 text-primary bg-dark-lighter border-gray-600 rounded focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Max Participants</label>
                <input 
                  type="number" 
                  name="maxParticipants"
                  value={systemSettings.maxParticipants}
                  onChange={handleSettingsChange}
                  min="1"
                  max="50"
                  className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  name="sessionTimeout"
                  value={systemSettings.sessionTimeout}
                  onChange={handleSettingsChange}
                  min="15"
                  max="180"
                  className="w-full p-2 rounded bg-dark-lighter text-white border border-gray-600"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}
              <button 
                onClick={handleSaveSettings}
                className="w-full bg-primary text-white py-2 rounded mt-2 disabled:opacity-50" 
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickActions