
import React from 'react';
import { useApp } from '../context/AppContext';
import { KARATS } from '../constants';

export const KaratGrid: React.FC = () => {
  const { goldData, settings, formatNumber, t, language } = useApp();

  const calculatePrice = (priceUSD: number, karat: number) => {
    // Step 2: 10 Tola without premium
    const tenTolaWithoutPremium = priceUSD * settings.currencyConversion;
    
    // Base per gram: 10_tola_without_premium / 116.64
    const basePerGram = tenTolaWithoutPremium / 116.64;
    
    // Step 5: Formulas per karat
    let factor = 1.0;
    if (karat === 22) factor = 0.916;
    if (karat === 21) factor = 0.875;
    if (karat === 18) factor = 0.750;
    
    const basePrice = basePerGram * factor;
    const premium = settings.premiumMarkupValues?.[karat] ?? 0;
    
    return basePrice + premium;
  };

  const currencyDisplay = language === 'ar' ? t('currency_name') : settings.currencySymbol;

  // Determine Dot Status
  let dotColor = 'bg-amber-500 shadow-amber-500/50';
  let dotTitle = 'Demo/Offline Mode';

  if (goldData.isLive) {
      dotColor = 'bg-green-500 shadow-green-500/50';
      dotTitle = 'Live API Connection';
  } else if (!settings.isDemoMode && goldData.apiError) {
      dotColor = 'bg-red-500 shadow-red-500/50';
      dotTitle = `Connection Error: ${goldData.apiError}`;
  }

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-800 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
        <h3 className="text-gold-400 font-bold tracking-wider uppercase text-base">Live Market Rates</h3>
        <div 
          className={`h-2 w-2 rounded-full animate-pulse shadow-md ${dotColor}`}
          title={dotTitle}
        ></div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-800">
            {KARATS.map((karat) => {
              const price1g = calculatePrice(goldData.priceUSD, karat);
              
              return (
                <tr key={karat} className="bg-slate-900 hover:bg-slate-800/50 transition-colors group">
                  <td className="px-4 py-3 text-xl text-slate-300 font-bold border-r border-slate-800 w-1/3 group-hover:text-gold-200">
                    {formatNumber(karat)} {t('karat_symbol')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight group-hover:text-gold-400 transition-colors">
                      {formatNumber(price1g.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-bold text-base w-16">
                    {currencyDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Decorative Gold Bottom Border */}
      <div className="h-0.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 w-full shrink-0"></div>
    </div>
  );
};