
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Plus, Trash2, Sliders, DollarSign, Briefcase, Zap, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Charge } from '../types';
import { KARATS } from '../constants';
import { checkApiKey } from '../services/goldService';

export const AdminPanel: React.FC = () => {
  const { settings, updateSettings, t } = useApp();
  const [activeTab, setActiveTab] = useState<'api' | 'price' | 'charges'>('api');
  const [localSettings, setLocalSettings] = useState(settings);
  const [showToast, setShowToast] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    updateSettings(localSettings);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (field: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleChargeAdd = () => {
    const newCharge: Charge = {
      id: Date.now().toString(),
      name: 'REGION',
      type: 'fixed',
      value: 0,
      subtitle: '0 - 0'
    };
    setLocalSettings(prev => ({
      ...prev,
      charges: [...prev.charges, newCharge]
    }));
  };

  const handleChargeUpdate = (id: string, field: keyof Charge, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      charges: prev.charges.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleChargeDelete = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      charges: prev.charges.filter(c => c.id !== id)
    }));
  };

  const handleTestApi = async () => {
    if (!localSettings.apiKey) {
        setTestStatus('error');
        setTestMessage('No API Key');
        setTimeout(() => setTestStatus('idle'), 3000);
        return;
    }
    setTestStatus('testing');
    setTestMessage('');
    const result = await checkApiKey(localSettings.apiKey);
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
    
    // Reset status after a delay only if success, keep error visible longer or until user acts
    if (result.success) {
        setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Briefcase className="text-gold-500" />
          {t('admin_panel')}
        </h2>
        <button
          onClick={handleSave}
          className="bg-gold-500 hover:bg-gold-400 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Save className="w-5 h-5" />
          {t('save_changes')}
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          {t('success_save')}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'api', label: t('api_settings'), icon: Zap },
          { id: 'price', label: t('price_settings'), icon: DollarSign },
          { id: 'charges', label: t('charges'), icon: Sliders },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-slate-800 border-gold-500/50 text-gold-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl min-h-[400px]">
        
        {/* API Settings */}
        {activeTab === 'api' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
              <label className="text-slate-300 font-medium">{t('demo_mode')}</label>
              <div 
                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${localSettings.isDemoMode ? 'bg-green-600' : 'bg-slate-700'}`}
                onClick={() => handleChange('isDemoMode', !localSettings.isDemoMode)}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${localSettings.isDemoMode ? 'translate-x-7 rtl:-translate-x-7' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">{t('api_key')}</label>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={localSettings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    placeholder="Enter API Key"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-gold-500 outline-none placeholder-slate-600"
                    disabled={localSettings.isDemoMode}
                />
                <button
                    onClick={handleTestApi}
                    disabled={localSettings.isDemoMode || testStatus === 'testing' || !localSettings.apiKey}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg border border-slate-700 transition-colors flex items-center justify-center min-w-[80px]"
                >
                    {testStatus === 'testing' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : testStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : testStatus === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                        "Test"
                    )}
                </button>
              </div>
              {testStatus === 'success' && (
                  <p className="text-green-500 text-xs mt-2 pl-1">✓ {testMessage || 'Verified'}</p>
              )}
              {testStatus === 'error' && (
                  <p className="text-red-500 text-xs mt-2 pl-1">⚠ {testMessage || 'Failed'}</p>
              )}
              <p className="text-slate-500 text-xs mt-3 pl-1">
                Get your key from <a href="https://metalpriceapi.com/" target="_blank" rel="noreferrer" className="text-gold-500 hover:underline">metalpriceapi.com</a>
              </p>
            </div>
          </div>
        )}

        {/* Price Settings */}
        {activeTab === 'price' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Column 1: Base Config */}
               <div className="space-y-6">
                  {/* Manual Override Toggle */}
                   <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium">{t('use_manual')}</label>
                    <div 
                      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${localSettings.useManualPrice ? 'bg-green-600' : 'bg-slate-700'}`}
                      onClick={() => handleChange('useManualPrice', !localSettings.useManualPrice)}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${localSettings.useManualPrice ? 'translate-x-7 rtl:-translate-x-7' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">{t('usd_price')}</label>
                    <input 
                      type="number" 
                      value={localSettings.manualPriceUSD}
                      onChange={(e) => handleChange('manualPriceUSD', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-gold-500"
                      disabled={!localSettings.useManualPrice}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">{t('conversion_rate')}</label>
                      <input 
                        type="number" 
                        value={localSettings.currencyConversion}
                        onChange={(e) => handleChange('currencyConversion', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-gold-500"
                        step="0.0001"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">{t('currency_symbol')}</label>
                      <input 
                        type="text" 
                        value={localSettings.currencySymbol}
                        onChange={(e) => handleChange('currencySymbol', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
               </div>

               {/* Column 2: Premiums */}
               <div className="space-y-4">
                   {/* Premium Markup Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium">{t('enable_premium')}</label>
                    <div 
                      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${localSettings.enablePremiumMarkup ? 'bg-green-600' : 'bg-slate-700'}`}
                      onClick={() => handleChange('enablePremiumMarkup', !localSettings.enablePremiumMarkup)}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${localSettings.enablePremiumMarkup ? 'translate-x-7 rtl:-translate-x-7' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  {localSettings.enablePremiumMarkup && (
                    <div className="space-y-4">
                      
                      {/* 10 Tola Premiums */}
                      <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                         <h4 className="text-gold-400 text-xs font-bold uppercase mb-3">10 Tola Premiums</h4>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                               <label className="block text-slate-500 text-xs font-medium mb-1">{t('premium_10tola')}</label>
                               <input 
                                 type="number"
                                 value={localSettings.premium10Tola}
                                 onChange={(e) => handleChange('premium10Tola', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500 text-sm"
                               />
                            </div>
                         </div>
                      </div>

                      {/* Ginni Premium */}
                      <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                         <h4 className="text-gold-400 text-xs font-bold uppercase mb-3">Ginni Premium</h4>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                               <label className="block text-slate-500 text-xs font-medium mb-1">{t('premium_ginni')}</label>
                               <input 
                                 type="number"
                                 value={localSettings.premiumGinni}
                                 onChange={(e) => handleChange('premiumGinni', parseFloat(e.target.value) || 0)}
                                 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500 text-sm"
                               />
                            </div>
                         </div>
                      </div>

                      {/* Per Gram Premiums */}
                      <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                        <label className="block text-slate-400 text-sm font-medium mb-3">{t('per_gram_premiums')}</label>
                        <div className="grid grid-cols-2 gap-4">
                          {KARATS.map((karat) => (
                            <div key={karat}>
                              <label className="block text-slate-500 text-xs font-medium mb-1">{karat}K</label>
                              <input 
                                type="number" 
                                value={localSettings.premiumMarkupValues?.[karat] ?? 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setLocalSettings(prev => ({
                                        ...prev,
                                        premiumMarkupValues: {
                                            ...prev.premiumMarkupValues,
                                            [karat]: isNaN(val) ? 0 : val
                                        }
                                    }));
                                }}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-500 text-sm"
                                step="0.01"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
               </div>
            </div>

          </div>
        )}

        {/* Charges Settings */}
        {activeTab === 'charges' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 mb-4 bg-slate-950 rounded-lg border border-slate-800">
              <label className="text-slate-300 font-medium">{t('show_charges')}</label>
              <div 
                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${localSettings.showMakingCharges ? 'bg-green-600' : 'bg-slate-700'}`}
                onClick={() => handleChange('showMakingCharges', !localSettings.showMakingCharges)}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${localSettings.showMakingCharges ? 'translate-x-7 rtl:-translate-x-7' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 mb-2">
              <h3 className="text-slate-400 font-medium">{t('charges')}</h3>
              <button 
                onClick={handleChargeAdd}
                className="text-sm bg-slate-800 hover:bg-slate-700 text-gold-400 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('add_charge')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-3 px-2 font-medium w-1/3 text-xs uppercase tracking-wider">{t('charge_name')}</th>
                    <th className="py-3 px-2 font-medium w-1/3 text-xs uppercase tracking-wider">{t('charge_subtitle')}</th>
                    <th className="py-3 px-2 font-medium text-right text-xs uppercase tracking-wider">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {localSettings.charges.map((charge) => (
                    <tr key={charge.id} className="group hover:bg-slate-800/50">
                      <td className="py-3 px-2">
                        <input 
                          type="text" 
                          value={charge.name}
                          onChange={(e) => handleChargeUpdate(charge.id, 'name', e.target.value)}
                          className="bg-transparent text-white border-b border-transparent focus:border-gold-500 outline-none w-full font-bold"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="text" 
                          value={charge.subtitle || ''}
                          onChange={(e) => handleChargeUpdate(charge.id, 'subtitle', e.target.value)}
                          className="bg-transparent text-slate-300 border-b border-transparent focus:border-gold-500 outline-none w-full"
                          placeholder="e.g. 4.5 - 3.8"
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => handleChargeDelete(charge.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
