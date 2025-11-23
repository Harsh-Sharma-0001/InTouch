import React, { useEffect, useState } from "react";
import { Play, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const RecentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 sessions per page

  useEffect(() => {
    setLoading(true);
    fetch("/api/interviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "Completed":
        return "text-green-500";
      case "scheduled":
      case "Scheduled":
        return "text-primary";
      case "cancelled":
      case "Cancelled":
        return "text-red-500";
      default:
        return "text-gray-text";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = sessions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewRecording = (session) => {
    if (session.recordingUrl) {
      window.open(session.recordingUrl, '_blank');
    } else {
      alert('No recording available for this session.');
    }
  };

  const handleViewMonitoring = (session) => {
    // Navigate to monitoring details page with session details
    window.open(`/monitoring-details?sessionId=${session._id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-border-color">
        <h3 className="text-lg font-semibold mb-2">Recent Interview Sessions</h3>
        <p className="text-gray-text text-sm mb-6">Loading recent sessions...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-border-color">
        <h3 className="text-lg font-semibold mb-2">Recent Interview Sessions</h3>
        <p className="text-red-500 text-sm mb-6">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-border-color">
      <h3 className="text-lg font-semibold mb-2">Recent Interview Sessions</h3>
      <p className="text-gray-text text-sm mb-6">Overview of recent interview activities</p>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-color">
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Date</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Time</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Candidate</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Interviewer</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Status</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Duration</th>
              <th className="py-3 px-4 text-gray-text text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSessions.map((session, index) => {
              // Parse date/time from session.time (ISO or string)
              let date = "-", time = "-";
              if (session.time) {
                const d = new Date(session.time);
                date = d.toLocaleDateString();
                time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              }
              return (
                <tr key={session._id || index} className="border-b border-border-color/50 last:border-b-0">
                  <td className="py-3 px-4 text-sm">{date}</td>
                  <td className="py-3 px-4 text-sm">{time}</td>
                  <td className="py-3 px-4 text-sm">{session.candidate}</td>
                  <td className="py-3 px-4 text-sm">{session.interviewer}</td>
                  <td className={`py-3 px-4 text-sm ${getStatusColor(session.status)}`}>{session.status}</td>
                  <td className="py-3 px-4 text-sm">{session.duration}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-4 items-center">
                      <button 
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
                        onClick={() => handleViewRecording(session)}
                      >
                        <Play size={16} />
                        <span className="text-gray-text text-xs">View Recording</span>
                      </button>
                      <button 
                        className="text-gray-text hover:text-white transition-colors flex items-center space-x-1"
                        onClick={() => handleViewMonitoring(session)}
                      >
                        <Eye size={16} />
                        <span className="text-gray-text text-xs">View Monitoring</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button 
            className="flex items-center space-x-1 text-gray-text hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded text-sm flex items-center justify-center transition-colors ${
                  currentPage === page 
                    ? 'bg-primary text-white' 
                    : 'text-gray-text hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button 
            className="flex items-center space-x-1 text-gray-text hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentSessions;
