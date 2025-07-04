
export interface EmailAnalysisResult {
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  issues: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

export const analyzeEmail = (email: string): EmailAnalysisResult => {
  const issues: EmailAnalysisResult['issues'] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    issues.push({
      type: 'Invalid Format',
      message: 'Email address format is invalid',
      severity: 'high'
    });
    score -= 40;
    recommendations.push('Verify the email address format is correct');
  }

  // Common suspicious patterns
  const suspiciousPatterns = [
    { pattern: /[0-9]/, message: 'Contains numbers which may indicate typosquatting', severity: 'medium' as const },
    { pattern: /[il1]/, message: 'Contains characters that can be easily confused (i, l, 1)', severity: 'low' as const },
    { pattern: /-/, message: 'Contains hyphens which are sometimes used in phishing emails', severity: 'low' as const },
    { pattern: /\.co$/, message: 'Uses .co TLD instead of common .com (potential typosquatting)', severity: 'medium' as const },
  ];

  suspiciousPatterns.forEach(({ pattern, message, severity }) => {
    if (pattern.test(email)) {
      issues.push({
        type: 'Suspicious Pattern',
        message,
        severity
      });
      score -= severity === 'high' ? 30 : severity === 'medium' ? 20 : 10;
    }
  });

  // Common fake domains
  const fakeDomains = [
    'gmai1.com', 'gmail.co', 'gmial.com', 'gmai.com',
    'paypa1.com', 'paypal.co', 'paypaI.com',
    'amazon.co', 'amazom.com', 'amazon.cm',
    'micr0soft.com', 'microsoft.co', 'microsft.com',
    'apple.co', 'app1e.com', 'appl3.com',
    'facebook.co', 'facebook.cm', 'facebo0k.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && fakeDomains.includes(domain)) {
    issues.push({
      type: 'Fake Domain',
      message: `Domain "${domain}" appears to be impersonating a legitimate service`,
      severity: 'high'
    });
    score -= 50;
    recommendations.push('This domain is likely impersonating a legitimate service. Do not trust emails from this address.');
  }

  // Suspicious TLDs
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip', '.exe'];
  const tld = domain?.substring(domain.lastIndexOf('.'));
  if (tld && suspiciousTlds.includes(tld)) {
    issues.push({
      type: 'Suspicious TLD',
      message: `Top-level domain "${tld}" is commonly used for malicious purposes`,
      severity: 'high'
    });
    score -= 35;
    recommendations.push('Be extremely cautious with emails from this domain extension.');
  }

  // Length checks
  if (email.length > 50) {
    issues.push({
      type: 'Unusual Length',
      message: 'Email address is unusually long, which may indicate obfuscation',
      severity: 'medium'
    });
    score -= 15;
  }

  // Multiple consecutive dots
  if (/\.{2,}/.test(email)) {
    issues.push({
      type: 'Invalid Characters',
      message: 'Contains multiple consecutive dots',
      severity: 'high'
    });
    score -= 30;
  }

  // Determine risk level - Fixed the comparison logic
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
  
  if (score < 40 || highSeverityIssues > 0) {
    riskLevel = 'high';
  } else if (score < 70) {
    riskLevel = 'medium';
  }

  // Add general recommendations
  if (issues.length === 0) {
    recommendations.push('Email format appears valid, but always verify sender identity through other means.');
  } else {
    recommendations.push('Always verify the sender through alternative communication methods.');
    recommendations.push('Look for spelling errors or urgent language in the email content.');
    recommendations.push('Never provide sensitive information unless you can verify the sender.');
  }

  return {
    isSafe: score >= 70 && highSeverityIssues === 0,
    riskLevel,
    score: Math.max(0, score),
    issues,
    recommendations
  };
};
