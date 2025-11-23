import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MonitoringSection = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/monitoring/metrics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch metrics');
        return res.json();
      })
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleGoToMonitoring = () => {
    navigate('/monitoring');
  };

  if (loading) return <div className="bg-dark-card rounded-lg p-6 border border-border-color">Loading monitoring data...</div>;
  if (error) return <div className="bg-dark-card rounded-lg p-6 border border-border-color text-red-500">Error: {error}</div>;

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-border-color">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="text-primary" size={20} />
        <h3 className="text-lg font-semibold text-white">Anti-cheating Monitoring</h3>
      </div>
      <p className="text-gray-text text-sm mb-6">Quick overview of active monitoring sessions and alerts</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-white-600 mb-2">{metrics?.allClear ?? 0}</div>
          <div className="text-gray-text text-sm">Monitored Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-red-600 mb-2">{metrics?.criticalAlerts ?? 0}</div>
          <div className="text-gray-text text-sm">Active Alerts</div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <button 
          className="w-full mt-6 bg-dark-900 border border-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          onClick={handleGoToMonitoring}
        >
          <Shield size={16} />
          <span className='font-bold text-white-600'>Go to Monitoring View</span>
        </button>
      </div>
    </div>
  )
}

export default MonitoringSection