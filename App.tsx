
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
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-slate-950 text-slate-100 overflow-hidden">
      <Navbar currentView={activeView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow p-2 sm:p-3 overflow-y-auto">
        {activeView === 'dashboard' ? <Dashboard /> : <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-2 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} GoldPulse.</p>
        </div>
      </footer>
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
