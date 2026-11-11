import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickLogModal } from '../modals/QuickLogModal';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenQuickLog={() => setQuickLogOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openQuickLog: () => setQuickLogOpen(true) }} />
        </main>
      </div>

      <QuickLogModal
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        onSaved={() => {
          // Trigger a global custom event so active pages refresh their data
          window.dispatchEvent(new CustomEvent('lifetracker:datachanged'));
        }}
      />
    </div>
  );
};

