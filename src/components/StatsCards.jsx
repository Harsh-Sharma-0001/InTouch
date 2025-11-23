import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';

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

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">Loading stats...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const cards = [
    {
      title: 'Total Interviews',
      value: stats?.interviews?.total ?? 0,
      subtitle: 'All time',
      change: `+${stats?.interviews?.completed ?? 0} completed`,
      icon: TrendingUp,
      changeColor: 'text-green-500'
    },
    {
      title: 'Scheduled Interviews',
      value: stats?.interviews?.scheduled ?? 0,
      subtitle: 'Upcoming',
      change: `${stats?.interviews?.cancelled ?? 0} cancelled`,
      icon: Clock,
      changeColor: 'text-red-500'
    },
    {
      title: 'Total Candidates',
      value: stats?.candidates?.total ?? 0,
      subtitle: 'All time',
      change: `${stats?.candidates?.hired ?? 0} hired`,
      icon: CheckCircle,
      changeColor: 'text-green-500'
    },
    {
      title: 'Active Interviewers',
      value: stats?.candidates?.interviewing ?? 0,
      subtitle: 'Currently interviewing',
      change: `${stats?.candidates?.offered ?? 0} offers`,
      icon: Users,
      changeColor: 'text-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat, index) => (
        <div key={index} className="bg-dark-card rounded-lg p-6 border border-border-color">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-text text-sm">{stat.title}</div>
            <stat.icon size={20} className="text-gray-text" />
          </div>
          <div className="text-2xl font-semibold mb-1">{stat.value}</div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-text">{stat.subtitle}</span>
            <span className={stat.changeColor}>{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;