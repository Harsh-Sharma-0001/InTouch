import React, { useEffect, useState } from 'react';
import ChartsSection from '../components/ChartsSection';
import DeshStatsCards from '../components/DeshStatsCards';
import Footer from '../components/Footer';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => {
        setStats(data);
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
        <h1 className="text-2xl font-bold mb-4 text-white">Analytics & Insights</h1>
        {loading && <div className="text-gray-400">Loading analytics...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {stats && <DeshStatsCards stats={stats} />}
        <div className="mt-8">
          <ChartsSection />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Analytics; 