
// Mock data generator for demo mode
export const generateDemoPrice = (currentPrice: number, base: number, volatility: number = 2): number => {
  const change = (Math.random() - 0.5) * volatility;
  return Math.max(base * 0.8, currentPrice + change);
};

// Helper to fetch with CORS fallback
const robustFetch = async (url: string, signal: AbortSignal): Promise<Response> => {
  // Strategy: Direct -> Proxy 1 (Fast) -> Proxy 2 (Backup)
  
  // 1. Try Direct Fetch
  try {
    const response = await fetch(url, { signal });
    if (response.ok) return response;
    // If not OK (e.g. 403, 500), return it so we can handle API errors. 
    // If it's a CORS opaque response (type: opaque), fetch usually throws or returns status 0.
    if (response.status !== 0) return response; 
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    // Silent failure for direct fetch (CORS block), proceed to proxy
  }

  // 2. Try Primary Proxy (corsproxy.io) - Usually faster/reliable
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal });
    if (response.ok) return response;
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    // Silent failure
  }

  // 3. Try Secondary Proxy (allorigins.win) - Fallback
  try {
    const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl2, { signal });
    return response;
  } catch (error: any) {
    // If this is the last attempt, we throw the error to be caught by the main handler
    throw error; 
  }
};

export const fetchLivePrices = async (apiKey: string): Promise<{ gold: number | null, silver: number | null, error?: string }> => {
  if (!apiKey) return { gold: null, silver: null, error: 'Missing API Key' };
  
  const controller = new AbortController();
  // Increased timeout to 25s to accommodate multiple proxy attempts
  const timeoutId = setTimeout(() => controller.abort(), 25000); 

  try {
    // MetalPriceAPI returns rates relative to USD.
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`;

    const response = await robustFetch(url, controller.signal);
    
    clearTimeout(timeoutId);

    if (!response || !response.ok) {
        let errorMsg = response ? `HTTP Error ${response.status}` : 'Network Error';
        if (response?.status === 403) errorMsg = 'Invalid Key (403)';
        if (response?.status === 429) errorMsg = 'Limit Exceeded (429)';
        if (response?.status === 401) errorMsg = 'Unauthorized (401)';
        return { gold: null, silver: null, error: errorMsg };
    }

    const data = await response.json();

    if (data.success === false) {
        // Handle API-level errors (e.g., plan limits)
        const info = data.error?.type || data.error?.info || 'API Error';
        return { gold: null, silver: null, error: String(info) };
    }

    const xauRate = data.rates?.XAU;
    const xagRate = data.rates?.XAG;

    if (!xauRate) {
        return { gold: null, silver: null, error: 'No Data for XAU' };
    }

    // Invert rates to get Price per Ounce in USD (1 / Rate)
    const goldPrice = 1 / xauRate;
    const silverPrice = xagRate ? (1 / xagRate) : null;

    return {
      gold: goldPrice,
      silver: silverPrice,
      error: undefined
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    let msg = 'Network Error';
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        msg = 'Connection Timeout';
        // Suppress console error for expected timeouts/aborts
    } else {
        msg = error.message || 'Failed to fetch';
        console.error("API Fetch Failed:", msg);
    }
    
    return { gold: null, silver: null, error: msg };
  }
};

export const checkApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey) return { success: false, message: 'No API Key provided' };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); 

  try {
    // Lightweight check asking for just USD to validate key
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=USD`;
    
    const res = await robustFetch(url, controller.signal);
    
    clearTimeout(timeoutId);

    if (!res || !res.ok) {
        return { success: false, message: `HTTP Error: ${res?.status || 'Unknown'}` };
    }

    const data = await res.json();
    
    if (data.success === false) {
        return { success: false, message: data.error?.type || 'Invalid Key' };
    }
    
    return { success: true, message: 'Connection Successful' };
  } catch (e: any) {
    clearTimeout(timeoutId);
    const msg = (e.name === 'AbortError' || e.message?.includes('aborted')) 
        ? 'Connection Timeout' 
        : 'Network/CORS Error';
    return { success: false, message: msg };
  }
};
