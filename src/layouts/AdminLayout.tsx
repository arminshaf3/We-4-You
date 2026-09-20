import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { ToastContainer } from '../components/common/ToastContainer';
import { useApp } from '../context/AppContext';

export const AdminLayout: React.FC = () => {
  const { isAdminLoggedIn } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simulated access gating: if not logged in and not on login page, redirect to /admin/login
  if (!isAdminLoggedIn && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-content-body font-body antialiased">
      {/* Sidebar */}
      <div className="print:hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <AdminTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          <Outlet />
        </main>
      </div>

      <div className="print:hidden">
        <ToastContainer />
      </div>
    </div>
  );
};
