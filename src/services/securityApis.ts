
// Security API integrations using Supabase Edge Functions to avoid CORS issues

export interface APIKeyConfig {
  virusTotalKey?: string;
  urlVoidKey?: string;
  emailRepKey?: string;
}

export interface AdvancedEmailResult {
  isValid: boolean;
  isDisposable: boolean;
  isCatchAll: boolean;
  reputation: 'good' | 'neutral' | 'poor';
  deliverable: boolean;
  domain: {
    name: string;
    reputation: number;
    isBusinessDomain: boolean;
  };
}

export interface AdvancedURLResult {
  isMalicious: boolean;
  reputation: number;
  categories: string[];
  lastSeen: string;
  scanResults: {
    engine: string;
    result: 'clean' | 'malicious' | 'suspicious';
  }[];
}

// Hunter.io Email Verification via Edge Function
export const verifyEmailWithHunter = async (email: string, apiKey?: string): Promise<AdvancedEmailResult | null> => {
  // Use edge function instead of direct API call to avoid CORS
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('Supabase URL not configured');
    return null;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/hunter-email-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn('Hunter.io API error:', data.error);
      return null;
    }

    if (data) {
      return {
        isValid: data.isValid,
        isDisposable: data.isDisposable,
        isCatchAll: false,
        reputation: data.reputation,
        deliverable: data.isValid,
        domain: {
          name: email.split('@')[1],
          reputation: data.domain.reputation,
          isBusinessDomain: !data.isDisposable
        }
      };
    }
  } catch (error) {
    console.error('Hunter.io edge function error:', error);
  }
  
  return null;
};

// VirusTotal URL Scanner via Edge Function
export const scanURLWithVirusTotal = async (url: string, apiKey?: string): Promise<AdvancedURLResult | null> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('Supabase URL not configured');
    return null;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/virus-total-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn('VirusTotal API error:', data.error);
      return null;
    }

    if (data) {
      return {
        isMalicious: data.isMalicious,
        reputation: data.reputation,
        categories: ['scanned'],
        lastSeen: new Date().toISOString(),
        scanResults: data.scanResults
      };
    }
  } catch (error) {
    console.error('VirusTotal edge function error:', error);
  }
  
  return null;
};

// URLVoid URL Reputation Check via Edge Function
export const checkURLWithURLVoid = async (url: string, apiKey?: string): Promise<AdvancedURLResult | null> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('Supabase URL not configured');
    return null;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/urlvoid-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      throw new Error(`HTTP error! status: ${response.status}`);
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    
    if (data.error) {
      console.warn('URLVoid API error:', data.error);
      return null;
    }
    
    if (data) {
      return {
        isMalicious: data.isMalicious,
        reputation: data.reputation,
        categories: data.isMalicious ? ['malicious'] : ['clean'],
        lastSeen: new Date().toISOString(),
        scanResults: data.scanResults
      };
    }
  } catch (error) {
    console.error('URLVoid edge function error:', error);
  }
  
  return null;
};

// PhishTank URL Check (Free API)
export const checkURLWithPhishTank = async (url: string): Promise<AdvancedURLResult | null> => {
  // PhishTank has CORS restrictions, but we can try with a fallback approach
  try {
    // For now, return null as PhishTank requires server-side implementation
    // This could be implemented as another edge function if needed
    console.log('PhishTank check skipped due to CORS restrictions');
    return null;
  } catch (error) {
    console.error('PhishTank API error:', error);
  }
  
  return null;
};

// Email reputation check using multiple free services
export const checkEmailReputation = async (email: string): Promise<AdvancedEmailResult | null> => {
  const domain = email.split('@')[1];
  
  // Check against known disposable email providers
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'temp-mail.org', 'throwaway.email', 'fakeinbox.com', 'maildrop.cc'
  ];
  
  const isDisposable = disposableDomains.includes(domain.toLowerCase());
  
  // Check domain reputation based on our analysis
  const businessDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com'];
  const isBusinessDomain = businessDomains.includes(domain.toLowerCase()) || domain.includes('company');
  
  return {
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isDisposable,
    isCatchAll: false, // Would need API to determine
    reputation: isDisposable ? 'poor' : isBusinessDomain ? 'good' : 'neutral',
    deliverable: !isDisposable,
    domain: {
      name: domain,
      reputation: isDisposable ? 20 : isBusinessDomain ? 90 : 60,
      isBusinessDomain
    }
  };
};
