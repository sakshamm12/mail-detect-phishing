
import React, { useState } from 'react';
import { Mail, AlertTriangle, CheckCircle, XCircle, Search, Zap } from 'lucide-react';
import { analyzeEmail } from '../utils/emailDetection';
import { verifyEmailWithHunter, checkEmailReputation } from '../services/securityApis';
import { SecurityResult } from './SecurityResult';

interface EmailAnalyzerProps {
  apiKeys?: {
    virusTotalKey?: string;
    urlVoidKey?: string;
    emailRepKey?: string;
  };
}

export const EmailAnalyzer: React.FC<EmailAnalyzerProps> = ({ apiKeys }) => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!email.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Basic analysis
      const basicAnalysis = analyzeEmail(email);
      
      // Enhanced analysis with APIs
      let enhancedResult = { ...basicAnalysis };
      
      if (apiKeys?.emailRepKey) {
        console.log('Using Hunter.io API for advanced email verification...');
        const hunterResult = await verifyEmailWithHunter(email, apiKeys.emailRepKey);
        
        if (hunterResult) {
          // Merge Hunter.io results
          if (!hunterResult.isValid || hunterResult.isDisposable) {
            enhancedResult.issues.push({
              type: 'API Verification',
              message: hunterResult.isDisposable 
                ? 'Email uses a disposable/temporary email service' 
                : 'Email address is not deliverable',
              severity: 'high'
            });
            enhancedResult.score = Math.max(0, enhancedResult.score - 40);
          }
          
          if (hunterResult.reputation === 'poor') {
            enhancedResult.issues.push({
              type: 'Poor Reputation',
              message: 'Email domain has poor reputation according to security databases',
              severity: 'high'
            });
            enhancedResult.score = Math.max(0, enhancedResult.score - 30);
          }
          
          enhancedResult.recommendations.push(
            `Domain reputation score: ${hunterResult.domain.reputation}/100`
          );
        }
      } else {
        // Fallback to basic reputation check
        const basicRepCheck = await checkEmailReputation(email);
        if (basicRepCheck?.isDisposable) {
          enhancedResult.issues.push({
            type: 'Disposable Email',
            message: 'Email appears to be from a disposable email service',
            severity: 'high'
          });
          enhancedResult.score = Math.max(0, enhancedResult.score - 35);
        }
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
    } catch (error) {
      console.error('Analysis error:', error);
      setResult(analyzeEmail(email)); // Fallback to basic analysis
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
          <Mail className="w-6 h-6 mr-2 text-blue-400" />
          Advanced Email Security Analyzer
        </h2>
        <p className="text-slate-300">
          Enter an email address to check for suspicious patterns and verify with security databases
        </p>
        {apiKeys?.emailRepKey && (
          <div className="flex items-center justify-center mt-2 text-green-400 text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Enhanced with Hunter.io API
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter email address to analyze (e.g., suspicious@gmail.co)"
            className="w-full px-4 py-3 pl-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!email.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing with Security APIs...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Analyze Email Security</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <SecurityResult
          result={result}
          type="email"
          input={email}
        />
      )}

      {/* Example Section */}
      <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-3">Try These Examples:</h3>
        <div className="grid gap-2">
          {[
            'admin@gmai1.com',
            'security@paypa1.com',
            'noreply@amazon.co',
            'support@micr0soft.com',
            'test@10minutemail.com'
          ].map((example) => (
            <button
              key={example}
              onClick={() => setEmail(example)}
              className="text-left p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded transition-colors duration-200 text-sm font-mono"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
