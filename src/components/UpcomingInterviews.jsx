import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Video, Users, X } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [modalType, setModalType] = useState(null); // 'candidate-call' | 'video-interview' | 'follow-up' | null
  const [form, setForm] = useState({
    candidate: '',
    role: '',
    time: '',
    type: '',
    platform: '',
    interviewer: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/interviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch interviews');
        return res.json();
      })
      .then(data => {
        setInterviews(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));

  // Map interviews to days of the current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  const interviewsByDay = weekDays.map(day =>
    interviews.filter(interview => isSameDay(new Date(interview.time), day))
  );

  // Generate a unique roomId
  const generateRoomId = (type) => {
    return `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };

  const openModal = (type) => {
    setModalType(type);
    setForm({ candidate: '', role: '', time: '', type: type, platform: '', interviewer: '' });
    setFormError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const roomId = generateRoomId(form.type);
      const interviewData = { ...form, roomId };
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });
      if (!res.ok) throw new Error('Failed to schedule interview');
      closeModal();
      navigate(`/interview?roomId=${roomId}&type=${encodeURIComponent(form.type)}`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading upcoming interviews...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Upcoming Interviews</h2>
        <div className="flex items-center space-x-4">
          <button onClick={prevWeek} className="p-1 text-gray-text hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-medium">This Week</span>
          <button onClick={nextWeek} className="p-1 text-gray-text hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-text mb-2">{format(day, 'EEE')}</div>
            <div className={`rounded-lg p-3 h-20 flex flex-col items-center justify-center ${isSameDay(day, new Date()) ? 'bg-primary' : 'bg-dark-lighter'}`}>
              <div className="text-white font-medium mb-1">{format(day, 'd')}</div>
              <div className="flex space-x-1">
                {interviewsByDay[index].length === 0 ? (
                  <span className="text-gray-500 text-xs">-</span>
                ) : (
                  interviewsByDay[index].map((interview, idx) => (
                    <div key={interview._id || idx} className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs text-dark-lighter" title={interview.candidate}>
                      {interview.candidate?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => openModal('candidate-call')}
        >
          <Plus size={16} />
          <span>New Candidate Call</span>
        </button>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-dark-lighter text-gray-text rounded-lg hover:text-white hover:bg-dark-lighter/80 transition-colors"
          onClick={() => openModal('video-interview')}
        >
          <Video size={16} />
          <span>Video Interview</span>
        </button>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-dark-lighter text-gray-text rounded-lg hover:text-white hover:bg-dark-lighter/80 transition-colors"
          onClick={() => openModal('follow-up')}
        >
          <Users size={16} />
          <span>Follow-up Meeting</span>
        </button>
      </div>

      {/* Modal for scheduling interview */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeModal}>
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {modalType === 'candidate-call' && 'Schedule New Candidate Call'}
              {modalType === 'video-interview' && 'Schedule Video Interview'}
              {modalType === 'follow-up' && 'Schedule Follow-up Meeting'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="candidate" value={form.candidate} onChange={handleFormChange} required placeholder="Candidate Name" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="role" value={form.role} onChange={handleFormChange} required placeholder="Role" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="time" value={form.time} onChange={handleFormChange} required placeholder="Time (YYYY-MM-DDTHH:MM)" className="w-full p-2 rounded bg-dark-lighter text-white" type="datetime-local" />
              <input name="platform" value={form.platform} onChange={handleFormChange} required placeholder="Platform (e.g. Google Meet)" className="w-full p-2 rounded bg-dark-lighter text-white" />
              <input name="interviewer" value={form.interviewer} onChange={handleFormChange} required placeholder="Interviewer" className="w-full p-2 rounded bg-dark-lighter text-white" />
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <button type="submit" className="w-full bg-primary text-white py-2 rounded mt-2" disabled={submitting}>{submitting ? 'Scheduling...' : 'Schedule & Join'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingInterviews;