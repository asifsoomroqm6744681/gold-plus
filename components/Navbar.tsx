
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, LayoutDashboard, Globe, Repeat, Lock, LogOut, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'admin';
  setCurrentView: (view: 'dashboard' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { t, toggleLanguage, settings, updateSettings, isAdmin, verifyAdmin, logoutAdmin } = useApp();
  
  // States for hidden admin access
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAutoRotateToggle = () => {
    updateSettings({
      ...settings,
      autoRotateLanguage: !settings.autoRotateLanguage
    });
  };

  const handleThemeToggle = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      updateSettings({
        ...settings,
        rotateInterval: val
      });
    }
  };

  // Hidden trigger logic: Click 5 times to open login
  const handleSecretClick = () => {
    if (isAdmin) return; // Already logged in
    
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowLoginModal(true);
        return 0;
      }
      return newCount;
    });

    // Reset count if not clicked rapidly
    setTimeout(() => setClickCount(0), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdmin(pin)) {
        setShowLoginModal(false);
        setPin('');
        setError('');
    } else {
        setError(t('access_denied'));
        setPin('');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentView('dashboard');
  };

  return (
    <>
    <nav className="bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-gold-500/20 text-slate-900 dark:text-white sticky top-0 z-50 h-14 shrink-0 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Secret Trigger Area (Invisible on left) */}
          <div 
             className="absolute left-0 top-0 h-full w-16 z-50 cursor-default"
             onClick={handleSecretClick}
             title="" 
          ></div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Center Title */}
          <div className="hidden md:block text-center flex-1">
             <h2 className="text-lg font-medium text-slate-700 dark:text-slate-300 tracking-wide whitespace-nowrap">{t('karat_prices')}</h2>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end gap-2 flex-1">
            
            {/* Auto Rotate Control */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg p-0.5 mr-2 border border-slate-200 dark:border-slate-700/50">
               <button
                  onClick={handleAutoRotateToggle}
                  className={`p-1 rounded-md transition-all ${settings.autoRotateLanguage ? 'bg-gold-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-gold-500 dark:hover:text-gold-400'}`}
                  title="Auto Rotate Language"
               >
                 <Repeat className="w-3.5 h-3.5" />
               </button>
               <div className="flex items-center border-l border-slate-300 dark:border-slate-700 ml-1 pl-1">
                 <input 
                    type="number" 
                    min="1" 
                    max="60"
                    value={settings.rotateInterval}
                    onChange={handleIntervalChange}
                    className="w-6 bg-transparent text-center text-[10px] font-mono text-slate-600 dark:text-slate-300 outline-none appearance-none"
                    disabled={!settings.autoRotateLanguage}
                 />
                 <span className="text-[9px] text-slate-500 pr-1">{t('seconds')}</span>
               </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400"
              title={settings.theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t('switch_lang')}</span>
            </button>
            
            {/* Admin Controls - ONLY VISIBLE IF AUTHENTICATED */}
            {isAdmin && (
                <>
                    <button
                    onClick={() => setCurrentView(currentView === 'dashboard' ? 'admin' : 'dashboard')}
                    className={`p-1.5 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 ${currentView === 'admin' ? 'bg-gold-500 text-slate-900 hover:text-slate-900' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title={t('admin_panel')}
                    >
                    {currentView === 'dashboard' ? <Settings className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                    </button>
                    
                    <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-1"
                    title={t('logout')}
                    >
                    <LogOut className="w-4 h-4" />
                    </button>
                </>
            )}

          </div>
        </div>
      </div>
    </nav>

    {/* Admin Login Modal */}
    {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-gold-500 rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
                <button 
                    onClick={() => { setShowLoginModal(false); setPin(''); setError(''); }}
                    className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700">
                        <Lock className="w-6 h-6 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin_panel')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('enter_pin')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-center text-slate-900 dark:text-white text-lg tracking-widest focus:border-gold-500 outline-none"
                        placeholder="••••••"
                        autoFocus
                    />
                    
                    {error && (
                        <p className="text-red-500 text-xs text-center font-medium animate-pulse">{error}</p>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold py-3 rounded-lg transition-colors"
                    >
                        {t('login')}
                    </button>
                </form>
            </div>
        </div>
    )}
    </>
  );
};