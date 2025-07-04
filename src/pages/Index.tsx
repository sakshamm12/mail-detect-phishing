
import React, { useState } from 'react';
import { Shield, Mail, Link, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { EmailAnalyzer } from '../components/EmailAnalyzer';
import { URLAnalyzer } from '../components/URLAnalyzer';
import { SecurityHeader } from '../components/SecurityHeader';
import { APIConfiguration } from '../components/APIConfiguration';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'url'>('email');
  const [apiKeys, setApiKeys] = useState<{
    virusTotalKey?: string;
    urlVoidKey?: string;
    emailRepKey?: string;
  }>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <APIConfiguration onConfigChange={setApiKeys} />
      
      <div className="container mx-auto px-4 py-8">
        <SecurityHeader />
        
        <div className="max-w-4xl mx-auto mt-12">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Detector
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'url'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Link className="w-5 h-5 mr-2" />
              Phishing Link Detector
            </button>
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            {activeTab === 'email' ? (
              <EmailAnalyzer apiKeys={apiKeys} />
            ) : (
              <URLAnalyzer apiKeys={apiKeys} />
            )}
          </div>
        </div>

        {/* API Integration Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Enhanced Security APIs
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-slate-300">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-400">VirusTotal Integration</h4>
                <p className="text-sm">Real-time URL scanning with 60+ antivirus engines for comprehensive threat detection.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-400">Hunter.io Verification</h4>
                <p className="text-sm">Professional email verification and deliverability testing with domain reputation analysis.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-400">URLVoid + PhishTank</h4>
                <p className="text-sm">Domain reputation checking and community-driven phishing URL database lookups.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Security Best Practices
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-400">Email Security:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Always verify sender addresses carefully</li>
                  <li>• Look for typos in domain names</li>
                  <li>• Be suspicious of urgent requests</li>
                  <li>• Check for grammar and spelling errors</li>
                  <li>• Verify with multiple sources before trusting</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-red-400">Link Safety:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Hover over links before clicking</li>
                  <li>• Look for HTTPS in legitimate sites</li>
                  <li>• Be wary of shortened URLs</li>
                  <li>• Verify the actual destination domain</li>
                  <li>• Use security tools for unknown links</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
