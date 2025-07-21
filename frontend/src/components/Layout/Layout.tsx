import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isProducts = location.pathname.startsWith('/products');
  const isInvoices = location.pathname.startsWith('/invoices');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navbar */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar - only show on dashboard */}
        {isDashboard && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
            <Sidebar />
          </div>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${isDashboard ? 'lg:ml-64' : ''}`}>
          <div className={`${
            isDashboard 
              ? 'max-w-none px-6 py-8' 
              : (isProducts || isInvoices)
                ? 'max-w-none px-0 py-0' 
                : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          }`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;