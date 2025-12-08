
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
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gold_settings');
    let parsedSettings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;

    // Migration for new field structure
    if (!parsedSettings.premiumMarkupValues) {
        // If old single premium value exists, migrate it to all karats
        const oldVal = parsedSettings.premiumMarkupValue || 0;
        const newValues: {[key: number]: number} = {};
        KARATS.forEach(k => newValues[k] = oldVal);
        
        parsedSettings.premiumMarkupValues = newValues;
    }
    
    // Ensure all new keys exist with defaults if missing
    return { 
      ...DEFAULT_SETTINGS, 
      ...parsedSettings,
      premium10Tola: parsedSettings.premium10Tola ?? DEFAULT_SETTINGS.premium10Tola,
      premiumGinni: parsedSettings.premiumGinni ?? DEFAULT_SETTINGS.premiumGinni,
    };
  });

  const [language, setLanguage] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [goldData, setGoldData] = useState<GoldData>({
    priceUSD: 2500,
    priceSilverUSD: 30,
    lastUpdated: Date.now(),
    trend: 0,
    trendSilver: 0,
    isLive: false,
    apiError: undefined
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('gold_settings', JSON.stringify(settings));
  }, [settings]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrice();
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [settings]);

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
    if (newSettings.useManualPrice) {
      setGoldData(prev => ({
        ...prev,
        priceUSD: newSettings.manualPriceUSD,
        priceSilverUSD: newSettings.manualPriceSilverUSD,
        isLive: false,
        trend: 0,
        trendSilver: 0,
        apiError: undefined
      }));
    }
  };

  const verifyAdmin = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
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
    setIsLoading(true);

    let newGold = goldData.priceUSD;
    let newSilver = goldData.priceSilverUSD;
    let isLive = false;
    let apiError: string | undefined = undefined;

    if (settings.useManualPrice) {
      newGold = settings.manualPriceUSD;
      newSilver = settings.manualPriceSilverUSD;
    } else if (settings.isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 600));
      newGold = generateDemoPrice(goldData.priceUSD, 2500, 5);
      newSilver = generateDemoPrice(goldData.priceSilverUSD, 30, 0.2);
    } else {
      const apiData = await fetchLivePrices(settings.apiKey);
      if (apiData.gold) {
        newGold = apiData.gold;
        newSilver = apiData.silver || newSilver; // keep old if fail
        isLive = true;
      } else {
        // Fallback to Demo
        newGold = generateDemoPrice(goldData.priceUSD, 2500, 5);
        newSilver = generateDemoPrice(goldData.priceSilverUSD, 30, 0.2);
        apiError = apiData.error || 'Connection Failed';
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