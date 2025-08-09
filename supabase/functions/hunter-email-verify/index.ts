import { corsHeaders } from '../_shared/cors.ts'

interface EmailVerifyRequest {
  email: string
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
    const { email }: EmailVerifyRequest = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    const hunterApiKey = Deno.env.get('HUNTER_API_KEY')
    if (!hunterApiKey) {
      throw new Error('Hunter.io API key not configured')
    }

    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`
    )

    if (!response.ok) {
      throw new Error('Failed to verify email with Hunter.io')
    }

    const data = await response.json()

    let result = {
      isValid: false,
      isDisposable: false,
      reputation: 'neutral' as 'good' | 'neutral' | 'poor',
      domain: {
        reputation: 50
      }
    }

    if (data.data) {
      result = {
        isValid: data.data.result === 'deliverable',
        isDisposable: data.data.disposable || false,
        reputation: data.data.result === 'deliverable' ? 'good' : 
                   data.data.result === 'risky' ? 'neutral' : 'poor',
        domain: {
          reputation: data.data.score || 50
        }
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
    console.error('Hunter email verification error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false,
        isDisposable: false,
        reputation: 'neutral',
        domain: { reputation: 50 }
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