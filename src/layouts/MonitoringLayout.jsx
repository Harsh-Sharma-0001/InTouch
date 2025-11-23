import React, { useEffect, useState } from 'react';
import '../Monitoring.css';
import MonitoringHeader from '../components/MonitoringHeader';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import LiveInterviewFeeds from '../components/LiveInterviewFeeds';
import RecentAlertLogs from '../components/RecentAlertLogs';
import InterviewRiskScore from '../components/InterviewRiskScore';
import AIAnomalySummary from '../components/AIAnomalySummary';
import ActivityTimeline from '../components/ActivityTimeline';
import Footer from '../components/Footer';

const MonitoringLayout = () => {
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    setLoadingMetrics(true);
    fetch('/api/monitoring/metrics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch metrics');
        return res.json();
      })
      .then(data => {
        setMetrics(data);
        setLoadingMetrics(false);
      })
      .catch(err => {
        setMetricsError(err.message);
        setLoadingMetrics(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <MonitoringHeader />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard title="All Clear" value={metrics?.allClear ?? 0} icon="check" color="success" loading={loadingMetrics} />
              <MetricCard title="Minor Flags" value={metrics?.minorFlags ?? 0} icon="warning" color="warning" loading={loadingMetrics} />
              <MetricCard title="Critical Alerts" value={metrics?.criticalAlerts ?? 0} icon="alert" color="danger" loading={loadingMetrics} />
            </div>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <LiveInterviewFeeds />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <RecentAlertLogs />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <InterviewRiskScore />
                <AIAnomalySummary />
              </div>
            </div>
            <div className="grid grid-cols-1">
              <ActivityTimeline />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MonitoringLayout;