
import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

export const LivePriceCard: React.FC = () => {
  const { goldData, t, settings, language, formatNumber } = useApp();
  const { priceUSD, lastUpdated, trend, isLive, apiError } = goldData;

  const formattedTime = new Date(lastUpdated).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour12: false });
  const formattedDate = new Date(lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  
  // Format Date/Time to Arabic digits if needed
  const displayTime = formatNumber(formattedTime);
  const displayDate = formatNumber(formattedDate);

  // Step 2: Convert USD to 10 Tola Without Premium
  // Formula: 10_tola_without_premium = usd_per_ounce * 1.4485
  const tenTolaWithoutPremium = priceUSD * settings.currencyConversion;

  // Step 2b: 10 Tola With Premium (Display)
  // Formula: 10_tola_without_premium + premium_10_tola
  const premium10Tola = settings.premium10Tola || 0;
  const price10TolaFinal = tenTolaWithoutPremium + premium10Tola;

  // Step 3: Ginni (8 grams) — NO Premium
  // Formula: ginni_price = (10_tola_without_premium / 116.64) * 0.875 * 8
  const ginniPriceCalc = (tenTolaWithoutPremium / 116.64) * 0.875 * 8;
  
  // Apply Special Rounding: Decimal < 0.5 → round DOWN, Decimal >= 0.5 → round UP
  const ginniPriceFinal = Math.round(ginniPriceCalc);
  
  // Determine Currency Symbol/Name
  const currencyDisplay = language === 'ar' ? t('currency_name') : settings.currencySymbol;

  return (
    <div className="w-full flex flex-col h-full gap-3">
      {/* Top Boxes Row */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* USD Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group hover:border-gold-500/30 transition-colors h-28">
           <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
           
           <span className="text-base font-medium mb-1 text-slate-400">{t('usd_price')}</span>
           <span className="text-4xl font-bold tracking-tighter text-gold-400 drop-shadow-sm font-sans leading-none">
             {formatNumber(priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
           </span>
           <div className="flex items-center gap-1.5 mt-1.5">
             <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{t('oz')}</span>
             {trend !== 0 && (
                <span className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                  {formatNumber(Math.abs(trend).toFixed(2))}%
                </span>
             )}
           </div>
        </div>

        {/* 10 Tola Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group hover:border-gold-500/30 transition-colors h-28">
           <div className="absolute bottom-0 left-0 w-16 h-16 bg-gold-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
           
           <span className="text-base font-medium mb-1 text-slate-400">{currencyDisplay}</span>
           <span className="text-4xl font-bold tracking-tighter text-white drop-shadow-sm font-sans leading-none">
             {formatNumber(price10TolaFinal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
           </span>
           <span className="text-xs mt-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{t('ten_tola')}</span>
        </div>
      </div>

      {/* Bottom Row: Ginni Box (Full Width) */}
      <div className="grid grid-cols-2 gap-3 flex-grow min-h-[140px]">
        
        {/* Ginni Box */}
        <div className="col-span-2 bg-slate-900 border-2 border-gold-500 rounded-xl p-3 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gold-500/5 pointer-events-none"></div>
             
             <span className="text-base md:text-lg font-medium mb-1 text-gold-200 text-center uppercase tracking-wide">{t('eight_grams_21k')}</span>
             
             <div className="flex items-baseline gap-2 mb-1">
               <span className="text-6xl md:text-7xl font-bold tracking-tighter text-gold-400 drop-shadow-md font-sans leading-none">
                 {formatNumber(ginniPriceFinal)}
               </span>
             </div>
             
             <span className="text-sm px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30 mt-2">{currencyDisplay}</span>
        </div>
      </div>

      {/* Last Update Text */}
      <div className="text-center flex items-center justify-center gap-2">
        <p className="text-slate-600 text-[10px] font-mono tracking-wide">
          {t('last_updated')} {displayDate} {displayTime}
        </p>
        
        {/* Status Badge */}
        {isLive ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider border bg-green-500/10 text-green-500 border-green-500/20">
                LIVE
            </span>
        ) : apiError && !settings.isDemoMode ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider border bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1" title={apiError}>
                <AlertCircle className="w-2 h-2" /> ERROR
            </span>
        ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider border bg-amber-500/10 text-amber-500 border-amber-500/20">
                DEMO
            </span>
        )}
      </div>
    </div>
  );
};