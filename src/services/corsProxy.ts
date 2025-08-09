// CORS Proxy service for frontend-only API calls
// This provides multiple fallback options for bypassing CORS restrictions

export interface ProxyConfig {
  baseUrl: string;
  name: string;
  active: boolean;
}

// List of public CORS proxy services (use with caution in production)
const CORS_PROXIES: ProxyConfig[] = [
  {
    baseUrl: 'https://api.allorigins.win/raw?url=',
    name: 'AllOrigins',
    active: true
  },
  {
    baseUrl: 'https://corsproxy.io/?',
    name: 'CorsProxy.io',
    active: true
  },
  {
    baseUrl: 'https://cors-anywhere.herokuapp.com/',
    name: 'CORS Anywhere',
    active: false // Often rate limited
  },
  {
    baseUrl: 'https://api.codetabs.com/v1/proxy?quest=',
    name: 'CodeTabs',
    active: true
  }
];

export class CorsProxyService {
  private activeProxies: ProxyConfig[];

  constructor() {
    this.activeProxies = CORS_PROXIES.filter(proxy => proxy.active);
  }

  /**
   * Make a proxied request through available CORS proxy services
   */
  async makeProxiedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const errors: Error[] = [];

    for (const proxy of this.activeProxies) {
      try {
        const proxiedUrl = `${proxy.baseUrl}${encodeURIComponent(url)}`;
        console.log(`Attempting request via ${proxy.name}: ${proxiedUrl}`);

        const response = await fetch(proxiedUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PhishingDetector/1.0',
            ...options.headers
          }
        });

        if (response.ok) {
          console.log(`✅ Success via ${proxy.name}`);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ ${proxy.name} failed:`, error);
        errors.push(error as Error);
        continue;
      }
    }

    // If all proxies fail, throw the last error
    throw new Error(`All CORS proxies failed. Last error: ${errors[errors.length - 1]?.message}`);
  }

  /**
   * Make a JSONP request (for APIs that support it)
   */
  async makeJsonpRequest(url: string, callbackParam: string = 'callback'): Promise<any> {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement('script');
      
      // Set up the callback
      (window as any)[callbackName] = (data: any) => {
        document.head.removeChild(script);
        delete (window as any)[callbackName];
        resolve(data);
      };

      // Handle errors
      script.onerror = () => {
        document.head.removeChild(script);
        delete (window as any)[callbackName];
        reject(new Error('JSONP request failed'));
      };

      // Create the script URL
      const separator = url.includes('?') ? '&' : '?';
      script.src = `${url}${separator}${callbackParam}=${callbackName}`;
      
      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if ((window as any)[callbackName]) {
          document.head.removeChild(script);
          delete (window as any)[callbackName];
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Check if a proxy is working
   */
  async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const testUrl = 'https://httpbin.org/json';
      const response = await fetch(`${proxy.baseUrl}${encodeURIComponent(testUrl)}`, {
        method: 'GET',
        timeout: 5000
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of working proxies
   */
  async getWorkingProxies(): Promise<ProxyConfig[]> {
    const workingProxies: ProxyConfig[] = [];
    
    for (const proxy of this.activeProxies) {
      if (await this.testProxy(proxy)) {
        workingProxies.push(proxy);
      }
    }
    
    return workingProxies;
  }
}

export const corsProxy = new CorsProxyService();