
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, GoldData, Language } from '../types';
import { DEFAULT_SETTINGS, TRANSLATIONS, KARATS, ADMIN_PIN } from '../constants';
import { fetchLivePrices, generateDemoPrice } from '../services/goldService';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  goldData: GoldData;
  refreshPrice: () => Promise<void>;
  language: Language;
  toggleLanguage: () => void;
  isLoading: boolean;
  t: (key: string) => string;
  isAdmin: boolean;
  verifyAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  formatNumber: (num: number | string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // 1. Robust Settings Initialization
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('gold_settings');
      if (!saved) return DEFAULT_SETTINGS;

      const parsedSettings = JSON.parse(saved);

      // Migration: Handle old data structures gracefully
      if (!parsedSettings.premiumMarkupValues && parsedSettings.premiumMarkupValue) {
          const oldVal = parsedSettings.premiumMarkupValue || 0;
          const newValues: {[key: number]: number} = {};
          KARATS.forEach(k => newValues[k] = oldVal);
          parsedSettings.premiumMarkupValues = newValues;
      }
      
      // Deep merge to ensure new fields (like adminPin, theme) are present even if missing in saved data
      const mergedPremiumMarkupValues = {
          ...DEFAULT_SETTINGS.premiumMarkupValues,
          ...(parsedSettings.premiumMarkupValues || {})
      };

      return { 
        ...DEFAULT_SETTINGS, 
        ...parsedSettings,
        premiumMarkupValues: mergedPremiumMarkupValues,
        // Explicitly fallback for critical new fields
        premium10Tola: parsedSettings.premium10Tola ?? DEFAULT_SETTINGS.premium10Tola,
        premiumGinni: parsedSettings.premiumGinni ?? DEFAULT_SETTINGS.premiumGinni,
        fetchInterval: parsedSettings.fetchInterval ?? DEFAULT_SETTINGS.fetchInterval,
        theme: parsedSettings.theme ?? DEFAULT_SETTINGS.theme,
        adminPin: parsedSettings.adminPin ?? DEFAULT_SETTINGS.adminPin,
        charges: parsedSettings.charges ?? DEFAULT_SETTINGS.charges,
      };
    } catch (error) {
      console.error("Error loading settings, reverting to defaults:", error);
      return DEFAULT_SETTINGS;
    }
  });

  const [language, setLanguage] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 2. Gold Data Initialization with Persistence (Restores last known price)
  const [goldData, setGoldData] = useState<GoldData>(() => {
    // If Manual Mode is saved, prioritize manual values immediately
    if (settings.useManualPrice) {
        return {
            priceUSD: settings.manualPriceUSD,
            priceSilverUSD: settings.manualPriceSilverUSD,
            lastUpdated: Date.now(),
            trend: 0,
            trendSilver: 0,
            isLive: false
        };
    }

    // Otherwise try to load last fetched data to avoid flashing defaults
    try {
        const savedData = localStorage.getItem('gold_data');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (e) {
        console.warn("Failed to load saved gold data", e);
    }

    // Fallback default
    return {
      priceUSD: 2500,
      priceSilverUSD: 30,
      lastUpdated: Date.now(),
      trend: 0,
      trendSilver: 0,
      isLive: false,
      apiError: undefined
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gold_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Persist prices so we can restore them on reload/offline
    if (!settings.useManualPrice) {
        localStorage.setItem('gold_data', JSON.stringify(goldData));
    }
  }, [goldData, settings.useManualPrice]);

  // Theme Logic
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Language Logic
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language;
    if (language === 'ar') {
        document.body.classList.add('font-arabic');
        document.body.classList.remove('font-sans');
    } else {
        document.body.classList.add('font-sans');
        document.body.classList.remove('font-arabic');
    }
  }, [language]);

  // Auto Language Rotation
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (settings.autoRotateLanguage && settings.rotateInterval > 0) {
      intervalId = setInterval(() => {
        setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
      }, settings.rotateInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [settings.autoRotateLanguage, settings.rotateInterval]);

  // Dynamic Price Refresh Scheduler
  useEffect(() => {
    // 1. Fetch Immediately on mount or setting change
    refreshPrice();

    // 2. Schedule Interval
    const intervalTime = (settings.fetchInterval || 120) * 1000;
    const interval = setInterval(() => {
      refreshPrice();
    }, Math.max(intervalTime, 5000)); // Minimum 5s safety

    return () => clearInterval(interval);
  }, [settings.fetchInterval, settings.apiKey, settings.isDemoMode, settings.useManualPrice]);

  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const formatNumber = (num: number | string): string => {
    const str = num.toString();
    if (language !== 'ar') return str;
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // If switching to manual, update data immediately
    if (newSettings.useManualPrice) {
      setGoldData(prev => ({
        ...prev,
        priceUSD: newSettings.manualPriceUSD,
        priceSilverUSD: newSettings.manualPriceSilverUSD,
        isLive: false,
        trend: 0, // Reset trend in manual
        trendSilver: 0,
        apiError: undefined
      }));
    } else if (settings.useManualPrice && !newSettings.useManualPrice) {
        // If switching FROM manual TO live/demo, trigger refresh
        setTimeout(() => refreshPrice(), 0);
    }
  };

  const verifyAdmin = (pin: string): boolean => {
    const validPin = settings.adminPin || ADMIN_PIN;
    if (pin === validPin) {
        setIsAdmin(true);
        return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const refreshPrice = async () => {
    if (isLoading) return;
    
    // Safety check: If manual mode is on, ensure we stick to manual values
    // (This helps if refreshPrice is called by interval while in manual mode)
    if (settings.useManualPrice) {
        setGoldData(prev => {
            // Only update if values actually changed to prevent re-renders
            if (prev.priceUSD === settings.manualPriceUSD && prev.priceSilverUSD === settings.manualPriceSilverUSD) {
                return prev;
            }
            return {
                ...prev,
                priceUSD: settings.manualPriceUSD,
                priceSilverUSD: settings.manualPriceSilverUSD,
                isLive: false,
                apiError: undefined
            };
        });
        return;
    }

    setIsLoading(true);

    let newGold = goldData.priceUSD;
    let newSilver = goldData.priceSilverUSD;
    let isLive = false;
    let apiError: string | undefined = undefined;

    if (settings.isDemoMode) {
      // Small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 600));
      newGold = generateDemoPrice(goldData.priceUSD, 2500, 5);
      newSilver = generateDemoPrice(goldData.priceSilverUSD, 30, 0.2);
    } else {
      const apiData = await fetchLivePrices(settings.apiKey);
      if (apiData.gold) {
        newGold = apiData.gold;
        newSilver = apiData.silver || newSilver; // keep old silver if fail
        isLive = true;
      } else {
        // API Failed
        apiError = apiData.error || 'Connection Failed';
        
        // IMPORTANT: Do not overwrite data with demo values if we have valid saved data
        // Only generate demo data if we are completely at 0 or default
        if (newGold === 2500 && newSilver === 30 && goldData.lastUpdated < Date.now() - 1000 * 60 * 60) {
             // If data is stale or default, fallback to demo-like generation so user sees something
             newGold = generateDemoPrice(goldData.priceUSD, 2500, 5);
             newSilver = generateDemoPrice(goldData.priceSilverUSD, 30, 0.2);
        } else {
            // Keep existing values (Persistence)
            newGold = goldData.priceUSD;
            newSilver = goldData.priceSilverUSD;
        }
      }
    }

    const trend = goldData.priceUSD === 0 ? 0 : ((newGold - goldData.priceUSD) / goldData.priceUSD) * 100;
    const trendSilver = goldData.priceSilverUSD === 0 ? 0 : ((newSilver - goldData.priceSilverUSD) / goldData.priceSilverUSD) * 100;

    setGoldData({
      priceUSD: newGold,
      priceSilverUSD: newSilver,
      lastUpdated: Date.now(),
      trend,
      trendSilver,
      isLive,
      apiError
    });
    
    setIsLoading(false);
  };

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      goldData,
      refreshPrice,
      language,
      toggleLanguage,
      isLoading,
      t,
      isAdmin,
      verifyAdmin,
      logoutAdmin,
      formatNumber
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
