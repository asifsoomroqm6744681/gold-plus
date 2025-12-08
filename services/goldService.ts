
// Mock data generator for demo mode
export const generateDemoPrice = (currentPrice: number, base: number, volatility: number = 2): number => {
  const change = (Math.random() - 0.5) * volatility;
  return Math.max(base * 0.8, currentPrice + change);
};

export const fetchLivePrices = async (apiKey: string): Promise<{ gold: number | null, silver: number | null, error?: string }> => {
  if (!apiKey) return { gold: null, silver: null, error: 'Missing API Key' };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // MetalPriceAPI returns rates relative to USD (or base).
    // Example: 1 USD = 0.0005 XAU.
    // Price = 1 / Rate.
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
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
        const info = data.error?.type || data.error?.info || 'API Error';
        return { gold: null, silver: null, error: String(info) };
    }

    const xauRate = data.rates?.XAU;
    const xagRate = data.rates?.XAG;

    if (!xauRate) {
        return { gold: null, silver: null, error: 'No Data for XAU' };
    }

    // Invert rates to get Price per Ounce in USD
    const goldPrice = 1 / xauRate;
    const silverPrice = xagRate ? (1 / xagRate) : null;

    return {
      gold: goldPrice,
      silver: silverPrice,
      error: undefined
    };
  } catch (error: any) {
    console.warn("API Fetch Error:", error);
    return { gold: null, silver: null, error: error.message || 'Unknown Error' };
  }
};

export const checkApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey) return { success: false, message: 'No API Key provided' };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    // Lightweight check
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=USD`;
    
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
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
    return { success: false, message: e.name === 'AbortError' ? 'Connection Timeout' : 'Network/CORS Error' };
  }
};
