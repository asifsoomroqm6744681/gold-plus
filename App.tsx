
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const { isAdmin } = useApp();

  // Security Check: If attempting to view admin without auth, force dashboard
  const activeView = (currentView === 'admin' && isAdmin) ? 'admin' : 'dashboard';

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Navbar currentView={activeView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow p-2 sm:p-3 overflow-y-auto">
        {activeView === 'dashboard' ? <Dashboard /> : <AdminPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}