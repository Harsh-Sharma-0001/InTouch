import React from 'react';

import '../Admin.css';
import AdminHeader from '../components/AdminHeader';
import Sidebar from '../components/Sidebar';

import UserManagement from '../components/UserManagement';
import StatsCards from '../components/StatsCards';
import ChartsSection from '../components/ChartsSection';
import RecentSessions from '../components/RecentSessions';
import RecordedInterviews from '../components/RecordedInterviews';
import MonitoringSection from '../components/MonitoringSection';
import QuickActions from '../components/QuickActions';
import TemplateManagement from '../components/TemplateManagement';
import Footer from '../components/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-full mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-semibold mb-2">Admin Panel Overview</h1>
                <p className="text-gray-text">
                  Gain insights into interview performance and manage session logs.
                </p>
              </div>
              <UserManagement />
              <TemplateManagement />
              <StatsCards />
              <ChartsSection />
              <RecentSessions />
              <RecordedInterviews />
              <MonitoringSection />
              <QuickActions />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;