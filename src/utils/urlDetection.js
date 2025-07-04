
export const analyzeURL = (url) => {
  const issues = [];
  const recommendations = [];
  let score = 100;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    const domain = urlObj.hostname.toLowerCase();
    const protocol = urlObj.protocol;
    const path = urlObj.pathname;

    // Protocol check
    if (protocol === 'http:' && !domain.includes('localhost')) {
      issues.push({
        type: 'Insecure Protocol',
        message: 'Uses HTTP instead of HTTPS, data may not be encrypted',
        severity: 'medium'
      });
      score -= 25;
      recommendations.push('Avoid entering sensitive information on non-HTTPS sites');
    }

    // Suspicious domains that impersonate legitimate services
    const phishingDomains = [
      'paypa1.com', 'paypal-security.com', 'paypal.co', 'paypaI.com',
      'amazon-security.com', 'amazom.com', 'amazon.co', 'amaz0n.com',
      'google-security.com', 'goog1e.com', 'google.co',
      'microsoft-security.com', 'micr0soft.com', 'microsoft.co',
      'apple-security.com', 'app1e.com', 'apple.co',
      'facebook-security.com', 'facebo0k.com', 'facebook.co',
      'secure-bank-login.com', 'bank-security.com'
    ];

    if (phishingDomains.some(suspicious => domain.includes(suspicious))) {
      issues.push({
        type: 'Phishing Domain',
        message: 'Domain appears to impersonate a legitimate service',
        severity: 'high'
      });
      score -= 60;
      recommendations.push('This appears to be a fake website impersonating a legitimate service');
    }

    // Suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip', '.exe', '.bit'];
    const tld = domain.substring(domain.lastIndexOf('.'));
    if (suspiciousTlds.includes(tld)) {
      issues.push({
        type: 'Suspicious TLD',
        message: `Domain uses "${tld}" which is commonly associated with malicious sites`,
        severity: 'high'
      });
      score -= 40;
      recommendations.push('Be extremely cautious with this domain extension');
    }

    // URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 't.co', 'goo.gl', 'ow.ly', 'is.gd'];
    if (shorteners.some(shortener => domain.includes(shortener))) {
      issues.push({
        type: 'URL Shortener',
        message: 'URL is shortened, hiding the actual destination',
        severity: 'medium'
      });
      score -= 30;
      recommendations.push('URL shorteners can hide malicious destinations. Expand the URL first');
    }

    // Suspicious patterns in domain
    const suspiciousPatterns = [
      { pattern: /[0-9]/, message: 'Domain contains numbers (possible typosquatting)', severity: 'medium' },
      { pattern: /-security|-verify|-account|-update|-confirm/i, message: 'Contains security-related keywords often used in phishing', severity: 'high' },
      { pattern: /[il1]/, message: 'Contains easily confused characters (i, l, 1)', severity: 'low' },
    ];

    suspiciousPatterns.forEach(({ pattern, message, severity }) => {
      if (pattern.test(domain)) {
        issues.push({
          type: 'Suspicious Pattern',
          message,
          severity
        });
        score -= severity === 'high' ? 35 : severity === 'medium' ? 20 : 10;
      }
    });

    // Suspicious paths
    const suspiciousPaths = [
      '/verify', '/confirm', '/update', '/secure', '/login', '/signin', 
      '/account', '/security', '/suspended', '/locked', '/phishing'
    ];
    
    if (suspiciousPaths.some(suspPath => path.toLowerCase().includes(suspPath))) {
      issues.push({
        type: 'Suspicious Path',
        message: 'URL path contains keywords commonly used in phishing attacks',
        severity: 'medium'
      });
      score -= 25;
    }

    // Very long URLs (potential obfuscation)
    if (url.length > 100) {
      issues.push({
        type: 'Unusually Long URL',
        message: 'Extremely long URL may be attempting to hide malicious content',
        severity: 'medium'
      });
      score -= 20;
    }

    // Multiple subdomains
    const subdomains = domain.split('.');
    if (subdomains.length > 4) {
      issues.push({
        type: 'Multiple Subdomains',
        message: 'Excessive subdomains may indicate attempt to confuse users',
        severity: 'low'
      });
      score -= 15;
    }

    // IP addresses instead of domains
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipPattern.test(domain)) {
      issues.push({
        type: 'IP Address',
        message: 'URL uses IP address instead of domain name',
        severity: 'high'
      });
      score -= 45;
      recommendations.push('Legitimate websites rarely use IP addresses directly');
    }

  } catch (error) {
    issues.push({
      type: 'Invalid URL',
      message: 'URL format is invalid or malformed',
      severity: 'high'
    });
    score -= 50;
  }

  // Determine risk level
  let riskLevel = 'low';
  if (score < 40) riskLevel = 'high';
  else if (score < 70) riskLevel = 'medium';

  // Add general recommendations
  if (issues.length === 0) {
    recommendations.push('URL appears safe, but always verify the site\'s legitimacy before entering sensitive data');
  } else {
    recommendations.push('Always verify the website URL matches the official domain');
    recommendations.push('Look for HTTPS encryption on sites requiring sensitive information');
    recommendations.push('When in doubt, navigate to the site directly instead of clicking links');
  }

  return {
    isSafe: score >= 70 && issues.filter(i => i.severity === 'high').length === 0,
    riskLevel,
    score: Math.max(0, score),
    issues,
    recommendations
  };
};
