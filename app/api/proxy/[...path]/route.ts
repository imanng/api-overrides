import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findMatchingOverride } from '@/lib/matching'
import { proxyRequest } from '@/lib/proxy'

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params)
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>
) {
  try {
    const { path: pathSegments } = await params
    const path = '/' + pathSegments.join('/')
    
    // Build full path including query string for override matching
    const searchParams = request.nextUrl.searchParams.toString()
    const fullPathForMatching = path + (searchParams ? `?${searchParams}` : '')

    // Get all overrides
    const overrides = await prisma.override.findMany()

    // Parse request headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Parse request body if present
    let body: unknown = null
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        body = await request.json()
      } catch {
        // Body might be empty or invalid JSON
        body = null
      }
    } else if (contentType?.includes('text/') || contentType?.includes('application/x-www-form-urlencoded')) {
      try {
        body = await request.text()
      } catch {
        body = null
      }
    }

    // Check for matching override - use fullPathForMatching to include query string
    const matchingOverride = findMatchingOverride(
      {
        method: request.method,
        path: fullPathForMatching,
        headers,
        body,
      },
      overrides.map((override: { id: string; method: string; path: string; headers: string | null; body: string | null; status: number; responseBody: string; ipAddress: string | null; createdAt: Date; updatedAt: Date }) => ({
        id: override.id,
        method: override.method,
        path: override.path,
        headers: override.headers ? JSON.parse(override.headers) : null,
        body: override.body ? JSON.parse(override.body) : null,
        status: override.status,
        responseBody: JSON.parse(override.responseBody),
        ipAddress: override.ipAddress,
        createdAt: override.createdAt,
        updatedAt: override.updatedAt,
      }))
    )

    // If override found, return override response
    // Pass through all original request headers in the response
    if (matchingOverride) {
      const responseBody =
        typeof matchingOverride.responseBody === 'string'
          ? matchingOverride.responseBody
          : JSON.stringify(matchingOverride.responseBody)

      // Create response headers from original request headers
      const responseHeaders: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        // Skip certain headers that shouldn't be forwarded
        if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
          responseHeaders[key] = value
        }
      })

      return new NextResponse(responseBody, {
        status: matchingOverride.status,
        headers: {
          'Content-Type': 'application/json',
          ...responseHeaders,
        },
      })
    }

    // No override found, proxy to main API
    const config = await prisma.apiConfig.findFirst()

    if (!config || !config.baseUrl) {
      return NextResponse.json(
        { error: 'Main API not configured' },
        { status: 500 }
      )
    }

    // Build full URL for proxy (searchParams already extracted above)
    const fullPath = path + (searchParams ? `?${searchParams}` : '')

    // Proxy to main API - pass all headers through without comparison
    // Headers are only used for override matching above, not for filtering when proxying
    const proxyResponse = await proxyRequest(
      {
        method: request.method,
        url: fullPath,
        headers, // All original request headers passed through
        body,
      },
      {
        id: config.id,
        baseUrl: config.baseUrl,
        authHeaders: config.authHeaders ? JSON.parse(config.authHeaders) : null,
        timeout: config.timeout,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    )

    // Convert Response to NextResponse to ensure proper handling
    const proxyResponseBody = await proxyResponse.text()
    const responseHeaders: Record<string, string> = {}
    proxyResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return new NextResponse(proxyResponseBody, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error handling proxy request:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

