import { corsHeaders } from '../_shared/cors.ts'

interface VirusTotalRequest {
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
    const { url }: VirusTotalRequest = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    const virusTotalApiKey = Deno.env.get('VIRUSTOTAL_API_KEY')
    if (!virusTotalApiKey) {
      throw new Error('VirusTotal API key not configured')
    }

    // Submit URL for scanning
    const submitResponse = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `apikey=${virusTotalApiKey}&url=${encodeURIComponent(url)}`
    })

    if (!submitResponse.ok) {
      throw new Error('Failed to submit URL to VirusTotal')
    }

    // Wait briefly then get the report
    await new Promise(resolve => setTimeout(resolve, 2000))

    const reportResponse = await fetch(
      `https://www.virustotal.com/vtapi/v2/url/report?apikey=${virusTotalApiKey}&resource=${encodeURIComponent(url)}`
    )

    if (!reportResponse.ok) {
      throw new Error('Failed to get VirusTotal report')
    }

    const data = await reportResponse.json()

    let result = {
      isMalicious: false,
      reputation: 50,
      scanResults: []
    }

    if (data.response_code === 1) {
      const maliciousCount = data.positives || 0
      const totalScans = data.total || 1
      
      result = {
        isMalicious: maliciousCount > 0,
        reputation: Math.max(0, 100 - (maliciousCount / totalScans) * 100),
        scanResults: data.scans ? Object.entries(data.scans)
          .map(([engine, scanResult]: [string, any]) => ({
            engine,
            result: scanResult.detected ? 'malicious' : 'clean'
          }))
          .slice(0, 5) : []
      }
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
    console.error('VirusTotal scan error:', error)
    
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