import { NextRequest } from 'next/server'

/**
 * Get the client IP address from a Next.js request
 */
export function getClientIP(request: NextRequest): string | null {
  // Check various headers for the real IP (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback to Vercel forwarded IP
  const vercelIP = request.headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return vercelIP.trim()
  }

  return null
}
