import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="main-content-area">
        {/* Header */}
        <Header />
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;