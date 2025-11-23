import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';

const StatsCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
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

  if (loading) return <div className="p-6">Loading stats...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!stats) return null;

  const cards = [
    {
      icon: Calendar,
      value: stats.interviews.total,
      label: 'Total Interviews Scheduled',
      sublabel: 'All time',
      color: 'text-blue-400',
    },
    {
      icon: Clock,
      value: stats.interviews.scheduled,
      label: 'Pending Interviews',
      sublabel: 'Awaiting scheduling',
      color: 'text-yellow-400',
    },
    {
      icon: CheckCircle,
      value: stats.interviews.completed,
      label: 'Interviews Completed',
      sublabel: 'Successful closures',
      color: 'text-green-400',
    },
    {
      icon: Users,
      value: stats.candidates.total,
      label: 'Active Candidates',
      sublabel: 'Currently in pipeline',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, index) => (
        <div key={index} className="bg-dark-card rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <stat.icon className={`${stat.color}`} size={24} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-white mb-1">{stat.label}</div>
          <div className="text-xs text-gray-text">{stat.sublabel}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;