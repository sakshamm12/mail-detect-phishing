
import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff } from 'lucide-react';

export const APIConfiguration = ({ onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
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
    setIsOpen(false);
  };

  const handleInputChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
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
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">Show API Keys</span>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? 'Hide' : 'Show'}</span>
              </button>
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

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Privacy Note:</strong> API keys are stored locally in your browser and never sent to our servers. 
              They're only used to make direct API calls to the respective security services.
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
