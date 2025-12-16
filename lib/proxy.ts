import type { ApiConfig } from '@/types/api'

interface ProxyRequest {
  method: string
  url: string
  headers?: Record<string, string>
  body?: any
}

/**
 * Proxy a request to the main API
 */
export async function proxyRequest(
  request: ProxyRequest,
  config: ApiConfig
): Promise<Response> {
  const targetUrl = new URL(request.url, config.baseUrl).toString()

  // Pass through all request headers without comparison or filtering
  // Only add auth headers from config and remove host header
  const headers: Record<string, string> = {
    ...request.headers,
    ...(config.authHeaders || {}),
  }

  // Remove host header as it will be set by fetch
  delete headers['host']
  delete headers['Host']

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(config.timeout),
  }

  // Only include body for methods that support it
  if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    if (typeof request.body === 'string') {
      fetchOptions.body = request.body
    } else {
      fetchOptions.body = JSON.stringify(request.body)
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions)
    
    // Get response body as text to preserve it
    const responseText = await response.text()

    // Create new response with same status and headers
    return new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (error) {
    // Handle timeout or network errors
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

