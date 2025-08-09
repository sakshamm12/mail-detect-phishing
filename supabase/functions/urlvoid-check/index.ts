import { corsHeaders } from '../_shared/cors.ts'

interface URLVoidRequest {
  url: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { url }: URLVoidRequest = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }

    // Extract domain from URL
    let domain: string
    try {
      domain = new URL(url).hostname
    } catch {
      throw new Error('Invalid URL format')
    }

    const urlVoidApiKey = Deno.env.get('URLVOID_API_KEY')
    if (!urlVoidApiKey) {
      throw new Error('URLVoid API key not configured')
    }

    const response = await fetch(
      `https://api.urlvoid.com/v1/pay-as-you-go/?key=${urlVoidApiKey}&host=${domain}`
    )

    if (!response.ok) {
      throw new Error('Failed to check URL with URLVoid')
    }

    const text = await response.text()

    // Parse XML response (URLVoid returns XML)
    const detections = (text.match(/<detection>/g) || []).length
    const engines = (text.match(/<engine>/g) || []).length

    const result = {
      isMalicious: detections > 0,
      reputation: Math.max(0, 100 - (detections / Math.max(engines, 1)) * 100),
      scanResults: [{
        engine: 'URLVoid',
        result: detections > 0 ? 'malicious' : 'clean'
      }]
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('URLVoid check error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isMalicious: false,
        reputation: 50,
        scanResults: []
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})