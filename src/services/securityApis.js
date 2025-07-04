
// Hunter.io API for email verification
export const verifyEmailWithHunter = async (email, apiKey) => {
  try {
    const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`);
    const data = await response.json();
    
    if (data.data) {
      return {
        isValid: data.data.result === 'deliverable',
        isDisposable: data.data.disposable,
        reputation: data.data.score || 50,
        domain: {
          reputation: data.data.score || 50
        }
      };
    }
  } catch (error) {
    console.error('Hunter.io API error:', error);
  }
  return null;
};

// VirusTotal API for URL scanning
export const scanURLWithVirusTotal = async (url, apiKey) => {
  try {
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.response_code === 1) {
      const scanResults = Object.entries(data.scans || {}).map(([engine, result]) => ({
        engine,
        result: result.result === 'clean' ? 'clean' : 
                result.result === 'malicious' ? 'malicious' : 'suspicious'
      }));
      
      const maliciousCount = scanResults.filter(s => s.result === 'malicious').length;
      
      return {
        isMalicious: maliciousCount > 0,
        reputation: Math.max(0, 100 - (maliciousCount * 10)),
        scanResults
      };
    }
  } catch (error) {
    console.error('VirusTotal API error:', error);
  }
  return { isMalicious: false, reputation: 50, scanResults: [] };
};

// URLVoid API for domain reputation
export const checkURLWithURLVoid = async (url, apiKey) => {
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(`https://api.urlvoid.com/v1/pay-as-you-go/?key=${apiKey}&host=${domain}`);
    const data = await response.json();
    
    if (data.success) {
      const reputation = Math.max(0, 100 - (data.detections * 20));
      return {
        isMalicious: data.detections > 0,
        reputation,
        scanResults: []
      };
    }
  } catch (error) {
    console.error('URLVoid API error:', error);
  }
  return { isMalicious: false, reputation: 50, scanResults: [] };
};

// PhishTank API (free service)
export const checkURLWithPhishTank = async (url) => {
  try {
    const response = await fetch('https://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}&format=json`
    });
    
    const data = await response.json();
    
    return {
      isMalicious: data.results?.in_database || false,
      reputation: data.results?.in_database ? 0 : 75,
      scanResults: []
    };
  } catch (error) {
    console.error('PhishTank API error:', error);
  }
  return { isMalicious: false, reputation: 50, scanResults: [] };
};

// Basic email reputation check (fallback)
export const checkEmailReputation = async (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  // List of known disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];
  
  return {
    isDisposable: disposableDomains.includes(domain),
    reputation: disposableDomains.includes(domain) ? 10 : 70
  };
};
