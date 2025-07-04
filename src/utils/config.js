
// API Configuration with integrated keys
export const API_CONFIG = {
  // Hunter.io API key for email verification
  hunterApiKey: 'f34160bd95053294ec04ab9c8c7882bad7ec05f9',
  
  // VirusTotal API key for URL scanning
  virusTotalApiKey: 'a5ca95a121697ee67acab361cc20d397e8505636bf18a198085f69891145ee95',
  
  // URLVoid API key (can be added later if needed)
  urlVoidApiKey: process.env.VITE_URLVOID_API_KEY || '',
};

// Helper function to get API keys
export const getApiKeys = () => {
  return {
    emailRepKey: API_CONFIG.hunterApiKey,
    virusTotalKey: API_CONFIG.virusTotalApiKey,
    urlVoidKey: API_CONFIG.urlVoidApiKey
  };
};
