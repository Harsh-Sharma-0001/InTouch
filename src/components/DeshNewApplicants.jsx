import React, { useEffect, useState } from 'react';

const NewApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/candidates')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch applicants');
        return res.json();
      })
      .then(data => {
        setApplicants(data.slice(0, 4)); // Show only the most recent 4
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleViewAll = () => {
    setShowAll(true);
    setLoadingAll(true);
    fetch('/api/candidates')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch applicants');
        return res.json();
      })
      .then(data => {
        setAllApplicants(data);
        setLoadingAll(false);
      })
      .catch(err => {
        setError(err.message);
        setLoadingAll(false);
      });
  };

  if (loading) return <div className="p-6">Loading new applicants...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">New Applicants</h2>
        <button className="text-primary hover:text-primary/80 text-sm" onClick={handleViewAll}>View All</button>
      </div>

      <div className="space-y-4">
        {applicants.length === 0 ? (
          <div className="text-gray-text">No new applicants.</div>
        ) : (
          applicants.map((applicant, index) => (
            <div key={applicant._id || index} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {applicant.name?.split(' ').map(n => n[0]).join('') || '?'}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{applicant.name}</div>
                <div className="text-sm text-gray-text">{applicant.role}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for all applicants */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowAll(false)}>
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-white">All Applicants</h3>
            {loadingAll ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-4">
                {allApplicants.length === 0 ? (
                  <div className="text-gray-text">No applicants found.</div>
                ) : (
                  allApplicants.map((applicant, index) => (
                    <div key={applicant._id || index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {applicant.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{applicant.name}</div>
                        <div className="text-sm text-gray-text">{applicant.role}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewApplicants;