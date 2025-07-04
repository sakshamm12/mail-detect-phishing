
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Shield, Info } from 'lucide-react';

export const SecurityResult = ({ result, type, input }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return <Info className="w-4 h-4 text-blue-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {result.isSafe ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
          <div>
            <h3 className="text-xl font-bold text-white">
              {result.isSafe ? 'Appears Safe' : 'Security Risk Detected'}
            </h3>
            <p className="text-slate-300 text-sm font-mono break-all">{input}</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-lg border ${getRiskColor(result.riskLevel)}`}>
          <span className="font-semibold capitalize">{result.riskLevel} Risk</span>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Security Score</span>
          <span className="text-2xl font-bold text-white">{result.score}/100</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              result.score >= 70 ? 'bg-green-500' : 
              result.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.score}%` }}
          ></div>
        </div>
      </div>

      {/* Issues Found */}
      {result.issues.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Issues Detected ({result.issues.length})
          </h4>
          <div className="space-y-3">
            {result.issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600"
              >
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <p className="text-white font-medium">{issue.type}</p>
                  <p className="text-slate-300 text-sm mt-1">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Security Recommendations
          </h4>
          <div className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 text-slate-300">
                <span className="text-blue-400 font-bold">•</span>
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
