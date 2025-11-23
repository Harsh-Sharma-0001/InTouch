import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/candidates')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch candidates');
        return res.json();
      })
      .then(data => {
        setCandidates(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-dark flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Browse Candidates</h1>
        {loading && <div className="text-gray-400">Loading candidates...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-lighter rounded-lg">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate._id} className="border-b border-gray-700 hover:bg-dark-card transition-colors">
                  <td className="py-2 px-4 text-white">{candidate.name}</td>
                  <td className="py-2 px-4 text-white">{candidate.email}</td>
                  <td className="py-2 px-4 text-white">{candidate.role}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${candidate.status === 'hired' ? 'bg-green-600 text-white' : candidate.status === 'offered' ? 'bg-blue-600 text-white' : candidate.status === 'interviewing' ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'}`}>{candidate.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Candidates; 