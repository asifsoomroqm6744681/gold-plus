import React from 'react';
import { useApp } from '../context/AppContext';
import { LivePriceCard } from './LivePriceCard';
import { KaratGrid } from './KaratCard';

export const Dashboard: React.FC = () => {
  const { t, settings, formatNumber } = useApp();

  // Helper to translate default region names if they match
  const getChargeName = (name: string) => {
    const key = `region_${name.toLowerCase()}`;
    // Check if a translation exists for this key
    const translated = t(key);
    // If t returns the key itself (meaning no translation found), return the original name
    return translated === key ? name : translated;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 h-full flex flex-col">
      
      {/* Top Section: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        
        {/* Left Column: Live Rates */}
        <div className="h-full">
           <LivePriceCard />
        </div>

        {/* Right Column: Karat Table */}
        <div className="h-full">
           <KaratGrid />
        </div>
      </div>

      {settings.showMakingCharges && (
        <div className="mt-1">
          {/* Divider / Notice */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-950 px-3 text-xs text-gold-500 font-medium animate-pulse tracking-widest uppercase">
                {t('making_charge_notice')}
              </span>
            </div>
          </div>

          {/* Bottom Section: Charges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-2">
            {settings.charges.map((charge) => {
               // Translate name if possible, otherwise use existing
               const displayName = getChargeName(charge.name);
               // Format value if subtitle, otherwise just use value
               const displayValue = charge.subtitle 
                 ? formatNumber(charge.subtitle) 
                 : formatNumber(charge.value);

               return (
                <div key={charge.id} className="bg-slate-900 p-2 rounded-lg shadow-sm text-center border border-slate-800 hover:border-gold-500/50 transition-all hover:-translate-y-0.5 group">
                   <h3 className="text-gold-400 font-serif font-bold text-xs uppercase tracking-widest mb-0.5 group-hover:text-gold-300 truncate">{displayName}</h3>
                   <p className="text-xl font-bold text-slate-200 group-hover:text-white leading-tight">{displayValue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};