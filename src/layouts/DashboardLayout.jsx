import React from 'react';
import '../Desh.css';
import DeshHeader from '../components/DeshHeader';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import UpcomingInterviews from '../components/UpcomingInterviews';
import ProgressSection from '../components/ProgressSection';
import StatsCards from '../components/DeshStatsCards';
import ActiveProcesses from '../components/ActiveProcesses';
import TodaysInterviews from '../components/TodaysInterviews';
import NewApplicants from '../components/DeshNewApplicants';
import QuickActions from '../components/DeshQuickActions';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <div className="flex flex-1">
        <Sidebar role="user" />
        <div className="flex-1 flex flex-col">
          <DeshHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Welcome Section */}
              <WelcomeSection />

              {/* Main Grid Layout */}
              <div className="grid grid-cols-12 gap-6 mt-6">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <UpcomingInterviews />
                  <ProgressSection />
                  <StatsCards />
                  <ActiveProcesses />
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <TodaysInterviews />
                  <NewApplicants />
                  <QuickActions />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;