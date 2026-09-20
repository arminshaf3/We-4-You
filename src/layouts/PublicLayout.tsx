import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/public/Header';
import { Footer } from '../components/public/Footer';
import { ToastContainer } from '../components/common/ToastContainer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-content-body font-body selection:bg-mint selection:text-navy">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="flex-grow">
        <Outlet />
      </main>
      <div className="print:hidden">
        <Footer />
        <ToastContainer />
      </div>
    </div>
  );
};
