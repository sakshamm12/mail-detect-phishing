// Enhanced Security API integrations with CORS workarounds
import { corsProxy } from './corsProxy';

export interface APIKeyConfig {
  virusTotalKey?: string;
  urlVoidKey?: string;
  emailRepKey?: string;
}

export interface AdvancedEmailResult {
  isValid: boolean;
  isDisposable: boolean;
  reputation: 'good' | 'neutral' | 'poor';
  domain: {
    reputation: number;
  };
}

export interface AdvancedURLResult {
  isMalicious: boolean;
  reputation: number;
  scanResults: {
    engine: string;
    result: 'clean' | 'malicious' | 'suspicious';
  }[];
}

// Hunter.io Email Verification with CORS proxy
export const verifyEmailWithHunter = async (email: string, apiKey: string): Promise<AdvancedEmailResult | null> => {
  if (!apiKey) {
    console.warn('Hunter.io API key not provided');
    return null;
  }

  try {
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`;
    
    const response = await corsProxy.makeProxiedRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.data) {
      return {
        isValid: data.data.result === 'deliverable',
        isDisposable: data.data.disposable || false,
        reputation: data.data.result === 'deliverable' ? 'good' : 
                   data.data.result === 'risky' ? 'neutral' : 'poor',
        domain: {
          reputation: data.data.score || 50
        }
      };
    }
  } catch (error) {
    console.error('Hunter.io API error:', error);
    // Fallback to basic email validation
    return await checkEmailReputation(email);
  }
  
  return null;
};

// VirusTotal URL Scanner with CORS proxy
export const scanURLWithVirusTotal = async (url: string, apiKey: string): Promise<AdvancedURLResult | null> => {
  if (!apiKey) {
    console.warn('VirusTotal API key not provided');
    return null;
  }

  try {
    // First, submit the URL for scanning
    const submitUrl = 'https://www.virustotal.com/vtapi/v2/url/scan';
    const submitData = new URLSearchParams({
      apikey: apiKey,
      url: url
    });

    await corsProxy.makeProxiedRequest(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: submitData.toString()
    });

    // Wait a moment then get the report
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reportUrl = `https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`;
    const response = await corsProxy.makeProxiedRequest(reportUrl);
    const data = await response.json();
    
    if (data.response_code === 1) {
      const maliciousCount = data.positives || 0;
      const totalScans = data.total || 1;
      
      const scanResults = data.scans ? Object.entries(data.scans)
        .slice(0, 5)
        .map(([engine, result]: [string, any]) => ({
          engine,
          result: result.detected ? 'malicious' : 'clean'
        })) : [];

      return {
        isMalicious: maliciousCount > 0,
        reputation: Math.max(0, 100 - (maliciousCount / totalScans) * 100),
        scanResults
      };
    }
  } catch (error) {
    console.error('VirusTotal API error:', error);
  }
  
  return null;
};

// URLVoid URL Reputation Check with CORS proxy
export const checkURLWithURLVoid = async (url: string, apiKey: string): Promise<AdvancedURLResult | null> => {
  if (!apiKey) {
    console.warn('URLVoid API key not provided');
    return null;
  }

  try {
    const domain = new URL(url).hostname;
    const checkUrl = `https://api.urlvoid.com/v1/pay-as-you-go/?key=${apiKey}&host=${domain}`;
    
    const response = await corsProxy.makeProxiedRequest(checkUrl);
    const text = await response.text();
    
    // Parse XML response (URLVoid returns XML)
    const detections = (text.match(/<detection>/g) || []).length;
    const engines = (text.match(/<engine>/g) || []).length;

    return {
      isMalicious: detections > 0,
      reputation: Math.max(0, 100 - (detections / Math.max(engines, 1)) * 100),
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

// PhishTank URL Check with CORS proxy
export const checkURLWithPhishTank = async (url: string): Promise<AdvancedURLResult | null> => {
  try {
    // PhishTank API endpoint
    const phishTankUrl = 'https://checkurl.phishtank.com/checkurl/';
    const formData = new URLSearchParams({
      url: url,
      format: 'json'
    });

    const response = await corsProxy.makeProxiedRequest(phishTankUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    
    const data = await response.json();
    
    return {
      isMalicious: data.results?.in_database || false,
      reputation: data.results?.in_database ? 0 : 75,
      scanResults: [{
        engine: 'PhishTank',
        result: data.results?.in_database ? 'malicious' : 'clean'
      }]
    };
  } catch (error) {
    console.error('PhishTank API error:', error);
  }
  
  return null;
};

// Enhanced email reputation check with multiple validation methods
export const checkEmailReputation = async (email: string): Promise<AdvancedEmailResult | null> => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return null;
  }

  // Comprehensive list of disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'temp-mail.org', 'throwaway.email', 'fakeinbox.com', 'maildrop.cc',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
    'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'emailondeck.com',
    'filzmail.com', 'get2mail.fr', 'getairmail.com', 'getnada.com', 'harakirimail.com',
    'inboxalias.com', 'jetable.org', 'koszmail.pl', 'kurzepost.de', 'lifebyfood.com',
    'lroid.com', 'mytrashmail.com', 'no-spam.ws', 'nobulk.com', 'noclickemail.com',
    'nogmailspam.info', 'nomail2me.com', 'nospamfor.us', 'nowmymail.com', 'objectmail.com',
    'obobbo.com', 'oneoffemail.com', 'onewaymail.com', 'opayq.com', 'ordinaryamerican.net',
    'otherinbox.com', 'ovpn.to', 'owlpic.com', 'pancakemail.com', 'pcusers.otherinbox.com',
    'pjkh.com', 'plexolan.de', 'pookmail.com', 'proxymail.eu', 'rcpt.at',
    'receiveee.com', 'rhyta.com', 'royal.net', 'rtrtr.com', 'rudymail.com',
    'selfdestructingmail.com', 'sendspamhere.com', 'shieldedmail.com', 'smellfear.com',
    'snakemail.com', 'sneakemail.com', 'sofort-mail.de', 'sogetthis.com', 'soodonims.com',
    'spam.la', 'spamavert.com', 'spambob.net', 'spambob.org', 'spambog.com',
    'spambog.de', 'spambog.ru', 'spambox.us', 'spamcannon.com', 'spamcannon.net',
    'spamcero.com', 'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com', 'spamcowboy.net',
    'spamcowboy.org', 'spamday.com', 'spamex.com', 'spamfree24.com', 'spamfree24.de',
    'spamfree24.eu', 'spamfree24.net', 'spamfree24.org', 'spamgoes.com', 'spamgourmet.com',
    'spamgourmet.net', 'spamgourmet.org', 'spamhole.com', 'spamify.com', 'spaminator.de',
    'spamkill.info', 'spaml.com', 'spaml.de', 'spammotel.com', 'spamobox.com',
    'spamspot.com', 'spamthis.co.uk', 'spamthisplease.com', 'spamtrail.com', 'spamtroll.net'
  ];
  
  const isDisposable = disposableDomains.includes(domain);
  
  // Check for suspicious patterns in domain
  const suspiciousPatterns = [
    /temp/i, /disposable/i, /fake/i, /trash/i, /spam/i, /mail/i && /\d+/,
    /guerrilla/i, /mailinator/i, /10minute/i
  ];
  
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(domain));
  
  // Check domain age and reputation (basic heuristics)
  const commonProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'zoho.com', 'fastmail.com'
  ];
  
  const isCommonProvider = commonProviders.includes(domain);
  const isBusinessDomain = !isCommonProvider && !isDisposable && domain.includes('.');
  
  // Calculate reputation score
  let reputation: 'good' | 'neutral' | 'poor' = 'neutral';
  let reputationScore = 50;
  
  if (isDisposable || hasSuspiciousPattern) {
    reputation = 'poor';
    reputationScore = 10;
  } else if (isCommonProvider) {
    reputation = 'good';
    reputationScore = 85;
  } else if (isBusinessDomain) {
    reputation = 'good';
    reputationScore = 75;
  }
  
  return {
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isDisposable: isDisposable || hasSuspiciousPattern,
    reputation,
    domain: {
      reputation: reputationScore
    }
  };
};

// Utility function to test API connectivity
export const testAPIConnectivity = async (apiKeys: APIKeyConfig): Promise<{
  hunter: boolean;
  virusTotal: boolean;
  urlVoid: boolean;
  phishTank: boolean;
}> => {
  const results = {
    hunter: false,
    virusTotal: false,
    urlVoid: false,
    phishTank: false
  };

  // Test Hunter.io
  if (apiKeys.emailRepKey) {
    try {
      const testResult = await verifyEmailWithHunter('test@example.com', apiKeys.emailRepKey);
      results.hunter = testResult !== null;
    } catch {
      results.hunter = false;
    }
  }

  // Test VirusTotal
  if (apiKeys.virusTotalKey) {
    try {
      const testResult = await scanURLWithVirusTotal('https://example.com', apiKeys.virusTotalKey);
      results.virusTotal = testResult !== null;
    } catch {
      results.virusTotal = false;
    }
  }

  // Test URLVoid
  if (apiKeys.urlVoidKey) {
    try {
      const testResult = await checkURLWithURLVoid('https://example.com', apiKeys.urlVoidKey);
      results.urlVoid = testResult !== null;
    } catch {
      results.urlVoid = false;
    }
  }

  // Test PhishTank (no API key required)
  try {
    const testResult = await checkURLWithPhishTank('https://example.com');
    results.phishTank = testResult !== null;
  } catch {
    results.phishTank = false;
  }

  return results;
};