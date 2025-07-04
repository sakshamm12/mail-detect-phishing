
import React from 'react';
import { Shield, Eye } from 'lucide-react';

export const SecurityHeader = () => {
  return (
    <div className="text-center">
      <div className="flex justify-center items-center mb-6">
        <div className="relative">
          <Shield className="w-16 h-16 text-blue-400 animate-pulse" />
          <Eye className="w-6 h-6 text-white absolute top-5 left-5" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Safe Mail <span className="text-blue-400">Detective</span>
      </h1>
      
      <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Advanced email and link security analyzer to protect you from phishing attacks, 
        fake email addresses, and malicious URLs
      </p>
      
      <div className="flex justify-center items-center mt-6 space-x-8">
        <div className="flex items-center text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Real-time Analysis</span>
        </div>
        <div className="flex items-center text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Advanced Detection</span>
        </div>
        <div className="flex items-center text-purple-400">
          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Privacy Focused</span>
        </div>
      </div>
    </div>
  );
};
