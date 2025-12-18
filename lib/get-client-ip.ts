import { NextRequest } from 'next/server'
import { normalizeIP } from './ip-utils'

/**
 * Get the client IP address from a Next.js request
 * Returns normalized IP address (supports IPv4 and IPv6)
 */
export function getClientIP(request: NextRequest): string | null {
  // Check various headers for the real IP (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const rawIP = forwarded.split(',')[0].trim()
    return normalizeIP(rawIP)
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return normalizeIP(realIP.trim())
  }

  // Fallback to Vercel forwarded IP
  const vercelIP = request.headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return normalizeIP(vercelIP.trim())
  }

  return null
}
