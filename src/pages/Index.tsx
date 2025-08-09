
import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { testAPIConnectivity } from '../services/securityApis';

interface APIConfigurationProps {
  onConfigChange: (config: {
    virusTotalKey?: string;
    urlVoidKey?: string;
    emailRepKey?: string;
  }) => void;
}

export const APIConfiguration: React.FC<APIConfigurationProps> = ({ onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState<{
    hunter: boolean;
    virusTotal: boolean;
    urlVoid: boolean;
    phishTank: boolean;
  } | null>(null);
  const [config, setConfig] = useState({
    virusTotalKey: '',
    urlVoidKey: '',
    emailRepKey: ''
  });

  useEffect(() => {
    // Load saved API keys from localStorage
    const saved = localStorage.getItem('security-api-config');
    if (saved) {
      const parsedConfig = JSON.parse(saved);
      setConfig(parsedConfig);
      onConfigChange(parsedConfig);
    }
  }, [onConfigChange]);

  const handleSave = () => {
    localStorage.setItem('security-api-config', JSON.stringify(config));
    onConfigChange(config);
    setConnectivityStatus(null); // Reset connectivity status when config changes
    setIsOpen(false);
  };

  const handleTestConnectivity = async () => {
    setIsTestingConnectivity(true);
    try {
      const status = await testAPIConnectivity(config);
      setConnectivityStatus(status);
    } catch (error) {
      console.error('Connectivity test failed:', error);
      setConnectivityStatus({
        hunter: false,
        virusTotal: false,
        urlVoid: false,
        phishTank: false
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setConnectivityStatus(null); // Reset status when keys change
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-slate-600"
      >
        <Settings className="w-5 h-5" />
        <span>API Keys</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-400" />
            API Configuration
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">Enhanced Security Scanning</h3>
            <p className="text-slate-300 text-sm mb-4">
              Connect your API keys to enable advanced threat detection using industry-leading security services. 
              CORS proxy services are used to bypass browser restrictions.
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">Show API Keys</span>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? 'Hide' : 'Show'}</span>
              Enhanced Security APIs (CORS Proxy Enabled)
            </div>
          </div>

          {/* CORS Notice */}
                <p className="text-sm">Real-time URL scanning with 60+ antivirus engines via CORS proxy for comprehensive threat detection.</p>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm">Professional email verification and deliverability testing via secure proxy connection.</p>
                <p className="text-blue-200 text-sm">
                  This application uses CORS proxy services to bypass browser restrictions when calling external APIs. 
                  Your API keys are sent through these proxies, so only use test keys or keys with limited permissions.
                <p className="text-sm">Domain reputation checking and community-driven phishing URL database lookups via proxy.</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> This application uses CORS proxy services to bypass browser security restrictions. 
                API calls are routed through public proxy services for demonstration purposes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                VirusTotal API Key
                <span className="text-blue-400 ml-1">(URL Scanning)</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.virusTotalKey}
                onChange={(e) => handleInputChange('virusTotalKey', e.target.value)}
                placeholder="Enter your VirusTotal API key"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Get free API key from <a href="https://www.virustotal.com/gui/join-us" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">VirusTotal</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URLVoid API Key
                <span className="text-blue-400 ml-1">(Domain Reputation)</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.urlVoidKey}
                onChange={(e) => handleInputChange('urlVoidKey', e.target.value)}
                placeholder="Enter your URLVoid API key"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Get API key from <a href="https://www.urlvoid.com/api/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">URLVoid</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hunter.io API Key
                <span className="text-blue-400 ml-1">(Email Verification)</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.emailRepKey}
                onChange={(e) => handleInputChange('emailRepKey', e.target.value)}
                placeholder="Enter your Hunter.io API key"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Get free API key from <a href="https://hunter.io/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Hunter.io</a>
              </p>
            </div>
          </div>

          {/* Connectivity Test */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">API Connectivity Test</h4>
              <button
                onClick={handleTestConnectivity}
                disabled={isTestingConnectivity}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {isTestingConnectivity ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Test APIs</span>
                  </>
                )}
              </button>
            </div>
            
            {connectivityStatus && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center space-x-2 p-2 rounded ${connectivityStatus.hunter ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {connectivityStatus.hunter ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${connectivityStatus.hunter ? 'text-green-300' : 'text-red-300'}`}>
                    Hunter.io
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 p-2 rounded ${connectivityStatus.virusTotal ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {connectivityStatus.virusTotal ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${connectivityStatus.virusTotal ? 'text-green-300' : 'text-red-300'}`}>
                    VirusTotal
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 p-2 rounded ${connectivityStatus.urlVoid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {connectivityStatus.urlVoid ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${connectivityStatus.urlVoid ? 'text-green-300' : 'text-red-300'}`}>
                    URLVoid
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 p-2 rounded ${connectivityStatus.phishTank ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {connectivityStatus.phishTank ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${connectivityStatus.phishTank ? 'text-green-300' : 'text-red-300'}`}>
                    PhishTank
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Security Warning:</strong> API keys are stored locally in your browser and sent through CORS proxy services. 
              For production use, consider using server-side API calls or dedicated API keys with limited permissions.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              Save Configuration
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
