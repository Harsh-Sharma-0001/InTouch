import React, { useState } from 'react'
import { Calendar, FileText, BarChart3, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate();
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [form, setForm] = useState({
    candidate: '',
    role: '',
    time: '',
    type: '',
    platform: '',
    interviewer: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const actions = [
    {
      icon: Calendar,
      label: 'Schedule New Interview',
      color: 'bg-blue-500',
      onClick: () => setShowInterviewModal(true)
    },
    {
      icon: FileText,
      label: 'Manage Interview Templates',
      color: 'bg-green-500',
      onClick: () => navigate('/admin')
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      color: 'bg-purple-500',
      onClick: () => navigate('/analytics')
    },
    {
      icon: Search,
      label: 'Browse Candidates',
      color: 'bg-orange-500',
      onClick: () => navigate('/candidates')
    }
  ];

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      setSuccess('Interview scheduled!');
      setForm({ candidate: '', role: '', time: '', type: '', platform: '', interviewer: '' });
      setTimeout(() => setShowInterviewModal(false), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="p-4 bg-dark-lighter rounded-lg hover:bg-dark-lighter/80 transition-colors text-left"
            onClick={action.onClick}
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon size={20} className="text-white" />
            </div>
            <div className="text-sm text-white font-medium">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Modal for Schedule New Interview */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowInterviewModal(false)}>
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">Schedule New Interview</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="candidate" value={form.candidate} onChange={handleFormChange} required placeholder="Candidate Name" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="role" value={form.role} onChange={handleFormChange} required placeholder="Role" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="time" value={form.time} onChange={handleFormChange} required placeholder="Time (YYYY-MM-DDTHH:MM)" className="w-full p-2 rounded bg-dark-lighter text-white" type="datetime-local" />
              <input name="type" value={form.type} onChange={handleFormChange} required placeholder="Type (Online/In-person)" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="platform" value={form.platform} onChange={handleFormChange} required placeholder="Platform (e.g. Google Meet)" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="interviewer" value={form.interviewer} onChange={handleFormChange} required placeholder="Interviewer" className="w-full p-2 rounded bg-dark-lighter text-white" />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}
              <button type="submit" className="w-full bg-primary text-white py-2 rounded mt-2" disabled={submitting}>{submitting ? 'Scheduling...' : 'Schedule'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickActions