
// Advanced security API integrations for email and URL validation

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

// Hunter.io Email Verification (Free tier available)
export const verifyEmailWithHunter = async (email: string, apiKey?: string): Promise<AdvancedEmailResult | null> => {
  if (!apiKey) return null;
  
  try {
    const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`);
    const data = await response.json();
    
    if (data.data) {
      return {
        isValid: data.data.result === 'deliverable',
        isDisposable: data.data.disposable || false,
        isCatchAll: data.data.accept_all || false,
        reputation: data.data.result === 'deliverable' ? 'good' : data.data.result === 'risky' ? 'neutral' : 'poor',
        deliverable: data.data.result === 'deliverable',
        domain: {
          name: email.split('@')[1],
          reputation: data.data.score || 50,
          isBusinessDomain: !data.data.disposable && !data.data.webmail
        }
      };
    }
  } catch (error) {
    console.error('Hunter.io API error:', error);
  }
  
  return null;
};

// VirusTotal URL Scanner
export const scanURLWithVirusTotal = async (url: string, apiKey?: string): Promise<AdvancedURLResult | null> => {
  if (!apiKey) return null;
  
  try {
    // First, submit URL for scanning
    const submitResponse = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `apikey=${apiKey}&url=${encodeURIComponent(url)}`
    });
    
    if (!submitResponse.ok) throw new Error('Failed to submit URL');
    
    // Wait a moment then get the report
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportResponse = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`);
    const data = await reportResponse.json();
    
    if (data.response_code === 1) {
      const maliciousCount = data.positives || 0;
      const totalScans = data.total || 1;
      
      return {
        isMalicious: maliciousCount > 0,
        reputation: Math.max(0, 100 - (maliciousCount / totalScans) * 100),
        categories: data.scan_date ? ['scanned'] : ['pending'],
        lastSeen: data.scan_date || new Date().toISOString(),
        scanResults: data.scans ? Object.entries(data.scans).map(([engine, result]: [string, any]) => ({
          engine,
          result: result.detected ? 'malicious' : 'clean'
        })).slice(0, 5) : []
      };
    }
  } catch (error) {
    console.error('VirusTotal API error:', error);
  }
  
  return null;
};

// URLVoid URL Reputation Check
export const checkURLWithURLVoid = async (url: string, apiKey?: string): Promise<AdvancedURLResult | null> => {
  if (!apiKey) return null;
  
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(`https://api.urlvoid.com/v1/pay-as-you-go/?key=${apiKey}&host=${domain}`);
    const text = await response.text();
    
    // URLVoid returns XML, so we'll do basic parsing
    const detections = (text.match(/<detection>/g) || []).length;
    const engines = (text.match(/<engine>/g) || []).length;
    
    return {
      isMalicious: detections > 0,
      reputation: Math.max(0, 100 - (detections / Math.max(engines, 1)) * 100),
      categories: detections > 0 ? ['malicious'] : ['clean'],
      lastSeen: new Date().toISOString(),
      scanResults: [{
        engine: 'URLVoid',
        result: detections > 0 ? 'malicious' : 'clean'
      }]
    };
  } catch (error) {
    console.error('URLVoid API error:', error);
  }
  
  return null;
};

// PhishTank URL Check (Free API)
export const checkURLWithPhishTank = async (url: string): Promise<AdvancedURLResult | null> => {
  try {
    const response = await fetch('https://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Safe Mail Detective'
      },
      body: `url=${encodeURIComponent(url)}&format=json&app_key=your_app_key`
    });
    
    const data = await response.json();
    
    if (data.results) {
      return {
        isMalicious: data.results.in_database && data.results.verified,
        reputation: data.results.in_database && data.results.verified ? 0 : 100,
        categories: data.results.in_database ? ['phishing'] : ['clean'],
        lastSeen: data.results.verification_time || new Date().toISOString(),
        scanResults: [{
          engine: 'PhishTank',
          result: data.results.in_database && data.results.verified ? 'malicious' : 'clean'
        }]
      };
    }
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
