
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
    return response;
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
  // Note: This returns the raw content of the URL
  const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  return fetch(proxyUrl2, { signal });
};

export const fetchLivePrices = async (apiKey: string): Promise<{ gold: number | null, silver: number | null, error?: string }> => {
  if (!apiKey) return { gold: null, silver: null, error: 'Missing API Key' };
  
  const controller = new AbortController();
  // Increased timeout to 20s to accommodate multiple proxy attempts
  const timeoutId = setTimeout(() => controller.abort(), 20000); 

  try {
    // MetalPriceAPI returns rates relative to USD.
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`;

    const response = await robustFetch(url, controller.signal);
    
    clearTimeout(timeoutId);

    if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        if (response.status === 403) errorMsg = 'Invalid Key (403)';
        if (response.status === 429) errorMsg = 'Limit Exceeded (429)';
        if (response.status === 401) errorMsg = 'Unauthorized (401)';
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
    if (error.name === 'AbortError') {
        msg = 'Connection Timeout';
    } else if (error.message) {
        msg = error.message;
    }
    
    // Only log actual failures, not expected fallback warnings
    console.error("API Fetch Failed:", msg);
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

    if (!res.ok) {
        return { success: false, message: `HTTP Error: ${res.status}` };
    }

    const data = await res.json();
    
    if (data.success === false) {
        return { success: false, message: data.error?.type || 'Invalid Key' };
    }
    
    return { success: true, message: 'Connection Successful' };
  } catch (e: any) {
    clearTimeout(timeoutId);
    const msg = e.name === 'AbortError' ? 'Connection Timeout' : 'Network/CORS Error';
    return { success: false, message: msg };
  }
};
