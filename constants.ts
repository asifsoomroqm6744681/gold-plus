
import { AppSettings, Translation, Charge } from './types';

export const DEFAULT_CHARGES: Charge[] = [
  { id: '1', name: 'TURKISH', type: 'fixed', value: 4.5, subtitle: '4.5 - 3.8' },
  { id: '2', name: 'SAUDI', type: 'fixed', value: 4.8, subtitle: '4.8 - 4' },
  { id: '3', name: 'SINGAPORE', type: 'fixed', value: 3.5, subtitle: '3.5 - 3' },
  { id: '4', name: 'OMANI', type: 'fixed', value: 3.5, subtitle: '3.5 - 3' },
  { id: '5', name: 'EMIRATI', type: 'fixed', value: 3.8, subtitle: '3.8 - 2.8' },
  { id: '6', name: 'INDIAN', type: 'fixed', value: 4.0, subtitle: '4 - 3.5' },
  { id: '7', name: 'BAHRAINI', type: 'fixed', value: 4.0, subtitle: '4 - 3.5' },
  { id: '8', name: 'KHWATI', type: 'fixed', value: 4.0, subtitle: '4 - 3.5' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '2917bf5d71e666e9905ddca2a7d2ac6b',
  isDemoMode: false, // Set to false so it uses the key immediately
  useManualPrice: false,
  manualPriceUSD: 2500,
  manualPriceSilverUSD: 30,
  currencyConversion: 1.4485, // Acts as the multiplier factor for 10 Tola
  currencySymbol: 'OMR',
  charges: DEFAULT_CHARGES,
  showMakingCharges: true,
  enablePremiumMarkup: true, // Enabled by default to show premiums
  premiumMarkupValues: {
    24: 0,
    22: 0,
    21: 0,
    18: 0
  },
  premium10Tola: 6, // Default 6 as requested
  premiumGinni: 0,
  autoRotateLanguage: false,
  rotateInterval: 5,
};

export const KARATS = [24, 22, 21, 18];

export const ADMIN_PIN = '123456'; // Security PIN for Admin Access

export const TRANSLATIONS: Translation = {
  app_title: { en: 'Oman Gold Rate', ar: 'أسعار الذهب في عمان' },
  dashboard: { en: 'Dashboard', ar: 'الرئيسية' },
  admin_panel: { en: 'Admin', ar: 'الإدارة' },
  last_updated: { en: 'Last Update On', ar: 'آخر تحديث في' },
  price_up: { en: 'High', ar: 'مرتفع' },
  price_down: { en: 'Low', ar: 'منخفض' },
  karat_prices: { en: 'Oman Gold Rate', ar: 'أسعار الذهب في عمان' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  api_settings: { en: 'API', ar: 'API' },
  price_settings: { en: 'Prices', ar: 'الأسعار' },
  charges: { en: 'Charges', ar: 'المصنعية' },
  manual_update: { en: 'Manual', ar: 'يدوي' },
  save_changes: { en: 'Save', ar: 'حفظ' },
  api_key: { en: 'API Key', ar: 'مفتاح API' },
  usd_price: { en: 'USD', ar: 'دولار أمريكي' },
  usd_price_silver: { en: 'Silver USD', ar: 'فضة دولار' },
  conversion_rate: { en: 'Exchange Rate', ar: 'سعر الصرف' },
  currency_symbol: { en: 'Symbol', ar: 'الرمز' },
  use_manual: { en: 'Manual Override', ar: 'تعديل يدوي' },
  add_charge: { en: 'Add Region', ar: 'إضافة منطقة' },
  charge_name: { en: 'Region Name', ar: 'اسم المنطقة' },
  charge_value: { en: 'Calc Value', ar: 'قيمة الحساب' },
  charge_subtitle: { en: 'Display Range', ar: 'نطاق العرض' },
  action: { en: 'Del', ar: 'حذف' },
  fixed: { en: 'Fixed', ar: 'ثابت' },
  percent: { en: '%', ar: '%' },
  success_save: { en: 'Saved Successfully', ar: 'تم الحفظ بنجاح' },
  refreshing: { en: 'Updating...', ar: 'تحديث...' },
  switch_lang: { en: 'عربي', ar: 'English' },
  oz: { en: 'Oz.', ar: 'أونصة' },
  ten_tola: { en: '10 Tola.', ar: '١٠ توله' },
  making_charge_notice: { en: 'Making Charge Starting -----> Less Then 2.00 GRM Making Per Piece', ar: 'رسوم المصنعية تبدأ -----> أقل من ٢.٠٠ جرام مصنعية للقطعة' },
  gold_title: { en: 'Gold & Diamond', ar: 'للذهب والماس' },
  show_charges: { en: 'Show Making Charges', ar: 'إظهار المصنعية' },
  enable_premium: { en: 'Enable Premiums', ar: 'تفعيل العلاوات' },
  premium_amount: { en: 'Premium Amount', ar: 'قيمة العلاوة' },
  demo_mode: { en: 'Demo Mode', ar: 'الوضع التجريبي' },
  seconds: { en: 's', ar: 'ث' },
  eight_grams_21k: { en: 'Ginni (21K)', ar: 'الجني ٢١ ع' },
  base_price: { en: 'Base', ar: 'الأساس' },
  premium_label: { en: 'Premium', ar: 'العلاوة' },
  premium_10tola: { en: '10 Tola Premium', ar: 'علاوة ١٠ توله' },
  premium_ginni: { en: 'Ginni Premium', ar: 'علاوة الجني' },
  per_gram_premiums: { en: 'Per Gram Premiums', ar: 'علاوات الجرام' },
  enter_pin: { en: 'Enter Admin PIN', ar: 'أدخل رمز الإدارة' },
  access_denied: { en: 'Access Denied', ar: 'تم رفض الوصول' },
  login: { en: 'Login', ar: 'دخول' },
  logout: { en: 'Logout', ar: 'خروج' },
  
  // Specific Translations requested
  currency_name: { en: 'OMR', ar: 'ريال عماني' },
  karat_symbol: { en: 'Karat', ar: 'ع' },

  // Regions
  region_turkish: { en: 'TURKISH', ar: 'تركي' },
  region_saudi: { en: 'SAUDI', ar: 'سعودي' },
  region_singapore: { en: 'SINGAPORE', ar: 'سنغافوري' },
  region_omani: { en: 'OMANI', ar: 'عماني' },
  region_emirati: { en: 'EMIRATI', ar: 'إماراتي' },
  region_indian: { en: 'INDIAN', ar: 'هندي' },
  region_bahraini: { en: 'BAHRAINI', ar: 'بحريني' },
  region_khwati: { en: 'KHWATI', ar: 'كويتي' },
};
