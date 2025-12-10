
export type Language = 'en' | 'ar';

export interface GoldData {
  priceUSD: number; // Price per Ounce in USD
  priceSilverUSD: number; // Price per Ounce in USD
  lastUpdated: number;
  trend: number; // Percentage change
  trendSilver: number; // Percentage change
  isLive: boolean;
  apiError?: string; // Error message if API fails
}

export interface Charge {
  id: string;
  name: string;
  type: 'fixed' | 'percent';
  value: number;
  subtitle?: string; // Display text like "4.5 - 3.8"
}

export interface AppSettings {
  apiKey: string;
  isDemoMode: boolean;
  useManualPrice: boolean;
  manualPriceUSD: number;
  manualPriceSilverUSD: number;
  currencyConversion: number; // 1 USD = X Local Currency
  currencySymbol: string;
  charges: Charge[];
  showMakingCharges: boolean;
  enablePremiumMarkup: boolean;
  premiumMarkupValues: { [key: number]: number }; // Premium per gram per karat
  
  // New specific premiums
  premium10Tola: number;
  premiumGinni: number;

  autoRotateLanguage: boolean;
  rotateInterval: number; // Seconds
  
  // New Features
  fetchInterval: number; // Seconds
  theme: 'dark' | 'light';
  adminPin: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}