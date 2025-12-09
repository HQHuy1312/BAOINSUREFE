import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-brand-gray-100 p-4 sm:p-6 lg:p-8">
          <MainContent />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;