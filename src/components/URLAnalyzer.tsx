import React, { useState } from 'react';
import { Link, AlertTriangle, CheckCircle, XCircle, Search, Zap } from 'lucide-react';
import { analyzeURL } from '../utils/urlDetection';
import { scanURLWithVirusTotal, checkURLWithURLVoid, checkURLWithPhishTank } from '../services/securityApis';
import { SecurityResult } from './SecurityResult';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';

interface URLAnalyzerProps {
  apiKeys?: {
    virusTotalKey?: string;
    urlVoidKey?: string;
    emailRepKey?: string;
  };
}

export const URLAnalyzer: React.FC<URLAnalyzerProps> = ({ apiKeys }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user } = useAuth();
  const { saveAnalysis } = useAnalysisHistory();

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Basic analysis
      const basicAnalysis = analyzeURL(url);
      let enhancedResult = { ...basicAnalysis };
      
      // Enhanced analysis with APIs
      const apiPromises = [];
      
      if (apiKeys?.virusTotalKey) {
        console.log('Using VirusTotal API for URL scanning...');
        apiPromises.push(scanURLWithVirusTotal(url, apiKeys.virusTotalKey));
      }
      
      if (apiKeys?.urlVoidKey) {
        console.log('Using URLVoid API for domain reputation...');
        apiPromises.push(checkURLWithURLVoid(url, apiKeys.urlVoidKey));
      }
      
      // Always try PhishTank (free)
      console.log('Checking with PhishTank...');
      apiPromises.push(checkURLWithPhishTank(url));
      
      if (apiPromises.length > 0) {
        const apiResults = await Promise.allSettled(apiPromises);
        
        apiResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            const apiResult = result.value;
            
            if (apiResult.isMalicious) {
              enhancedResult.issues.push({
                type: 'Malicious URL Detected',
                message: 'URL flagged as malicious by security databases',
                severity: 'high'
              });
              enhancedResult.score = Math.max(0, enhancedResult.score - 60);
            }
            
            if (apiResult.reputation < 50) {
              enhancedResult.issues.push({
                type: 'Poor Reputation',
                message: `Domain has poor reputation (${Math.round(apiResult.reputation)}/100)`,
                severity: 'medium'
              });
              enhancedResult.score = Math.max(0, enhancedResult.score - 25);
            }
            
            if (apiResult.scanResults.length > 0) {
              const maliciousScans = apiResult.scanResults.filter(scan => scan.result === 'malicious').length;
              if (maliciousScans > 0) {
                enhancedResult.recommendations.push(
                  `${maliciousScans}/${apiResult.scanResults.length} security engines flagged this URL as malicious`
                );
              }
            }
          }
        });
      } else {
        enhancedResult.recommendations.push('Configure API keys for enhanced threat detection');
      }
      
      // Recalculate risk level
      const highSeverityIssues = enhancedResult.issues.filter(i => i.severity === 'high').length;
      if (enhancedResult.score < 40 || highSeverityIssues > 0) {
        enhancedResult.riskLevel = 'high';
      } else if (enhancedResult.score < 70) {
        enhancedResult.riskLevel = 'medium';
      }
      
      enhancedResult.isSafe = enhancedResult.score >= 70 && highSeverityIssues === 0;
      
      setResult(enhancedResult);
      
      // Save to history if user is authenticated
      if (user) {
        await saveAnalysis('url', url, enhancedResult);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const fallbackResult = analyzeURL(url);
      setResult(fallbackResult);
      
      // Save fallback result to history if user is authenticated
      if (user) {
        await saveAnalysis('url', url, fallbackResult);
      }
    }
    
    setIsAnalyzing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
          <Link className="w-6 h-6 mr-2 text-blue-400" />
          Advanced Phishing Link Detector
        </h2>
        <p className="text-slate-300">
          Analyze URLs and links with multiple security engines to detect phishing and malware
        </p>
        {(apiKeys?.virusTotalKey || apiKeys?.urlVoidKey) && (
          <div className="flex items-center justify-center mt-2 text-green-400 text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Enhanced with {[apiKeys?.virusTotalKey && 'VirusTotal', apiKeys?.urlVoidKey && 'URLVoid'].filter(Boolean).join(' + ')} APIs
          </div>
        )}
        {user && (
          <div className="flex items-center justify-center mt-2 text-blue-400 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Analysis will be saved to your history
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL to analyze (e.g., https://paypa1-security.com/login)"
            className="w-full px-4 py-3 pl-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <Link className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!url.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Scanning with Security APIs...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Analyze Link Security</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <SecurityResult
          result={result}
          type="url"
          input={url}
        />
      )}

      {/* Example Section */}
      <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Try These Examples:</h3>
        <div className="grid gap-2">
          {[
            'https://paypa1-security.com/login',
            'http://amazom-security.net/verify',
            'https://bit.ly/suspicious-link',
            'https://secure-bank-login.tk/auth',
            'https://microsoft-security-alert.ml/verify'
          ].map((example) => (
            <button
              key={example}
              onClick={() => setUrl(example)}
              className="text-left p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded transition-colors duration-200 text-sm font-mono break-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};