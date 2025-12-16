import type { Override } from '@/types/override'

interface RequestMatch {
  method: string
  path: string
  headers?: Record<string, string>
  body?: any
}

/**
 * Deep equality check for JSON objects
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1).sort()
    const keys2 = Object.keys(obj2).sort()
    
    if (keys1.length !== keys2.length) return false
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false
      if (!deepEqual(obj1[key], obj2[key])) return false
    }
    return true
  }

  return false
}

/**
 * Normalize headers for comparison (case-insensitive keys)
 */
function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value
  }
  return normalized
}

/**
 * Compare headers - checks if override headers match request headers
 * If override has a header, request must have it with same value
 */
function headersMatch(
  overrideHeaders: Record<string, string> | null,
  requestHeaders: Record<string, string>
): boolean {
  if (!overrideHeaders) return true // No header requirements means match

  const normalizedOverride = normalizeHeaders(overrideHeaders)
  const normalizedRequest = normalizeHeaders(requestHeaders)

  for (const [key, value] of Object.entries(normalizedOverride)) {
    if (normalizedRequest[key] !== value) {
      return false
    }
  }

  return true
}

/**
 * Normalize path by removing trailing slashes and ensuring consistent format
 */
function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/**
 * Check if a request matches an override
 */
export function matchesOverride(
  request: RequestMatch,
  override: Override
): boolean {
  // Method must match
  if (request.method.toUpperCase() !== override.method.toUpperCase()) {
    return false
  }

  // Path must match (normalized)
  if (normalizePath(request.path) !== normalizePath(override.path)) {
    return false
  }

  // Headers must match if override specifies headers
  if (override.headers && request.headers) {
    if (!headersMatch(override.headers, request.headers)) {
      return false
    }
  } else if (override.headers && !request.headers) {
    return false // Override requires headers but request has none
  }

  // Body must match if override specifies body
  if (override.body !== null && override.body !== undefined) {
    if (request.body === null || request.body === undefined) {
      return false
    }
    if (!deepEqual(override.body, request.body)) {
      return false
    }
  }

  return true
}

/**
 * Find matching override from a list
 */
export function findMatchingOverride(
  request: RequestMatch,
  overrides: Override[]
): Override | null {
  for (const override of overrides) {
    if (matchesOverride(request, override)) {
      return override
    }
  }
  return null
}

