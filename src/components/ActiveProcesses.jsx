import React, { useEffect, useState } from 'react';

const ActiveProcesses = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/interviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch interviews');
        return res.json();
      })
      .then(data => {
        setProcesses(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'scheduled':
        return 'px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium';
      case 'completed':
        return 'px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium';
      case 'cancelled':
        return 'px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium';
      default:
        return 'text-gray-text';
    }
  };

  if (loading) return <div className="p-6">Loading active processes...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Active Interview Processes</h2>
        <button className="text-primary hover:text-primary/80 text-sm" onClick={() => setShowAll(true)}>View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-text text-sm border-b border-border-color">
              <th className="pb-3 px-2">Candidate</th>
              <th className="pb-3 px-2">Role</th>
              <th className="pb-3 px-2">Stage</th>
              <th className="pb-3 px-2">Type</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {processes.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-gray-text text-center">No active interview processes.</td></tr>
            ) : (
              processes.slice(0, 5).map((process, index) => (
                <tr key={process._id || index} className="border-b border-border-color/50 last:border-b-0">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {process.candidate?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <span className="text-white">{process.candidate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-gray-text">{process.role}</td>
                  <td className="py-4 px-2">
                    <span className={getStatusClasses(process.status)}>
                      {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-text">{process.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for all processes */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowAll(false)}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">All Interview Processes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-text text-sm border-b border-border-color">
                    <th className="pb-3 px-2">Candidate</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2">Stage</th>
                    <th className="pb-3 px-2">Type</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {processes.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-gray-text text-center">No active interview processes.</td></tr>
                  ) : (
                    processes.map((process, index) => (
                      <tr key={process._id || index} className="border-b border-border-color/50 last:border-b-0">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {process.candidate?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                            <span className="text-white">{process.candidate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-text">{process.role}</td>
                        <td className="py-4 px-2">
                          <span className={getStatusClasses(process.status)}>
                            {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-text">{process.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProcesses;