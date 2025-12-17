import { prisma } from '@/lib/prisma'

/**
 * Normalize path by removing trailing slashes
 */
function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/**
 * Normalize and stringify headers for comparison
 */
function normalizeHeadersString(headers: Record<string, string> | null): string | null {
  if (!headers) return null
  
  // Normalize header keys to lowercase and sort
  const normalized: Record<string, string> = {}
  const sortedKeys = Object.keys(headers).sort()
  for (const key of sortedKeys) {
    normalized[key.toLowerCase()] = headers[key]
  }
  
  return JSON.stringify(normalized)
}

/**
 * Stringify body for comparison (handles null/undefined)
 */
function normalizeBodyString(body: any | null): string | null {
  if (body === null || body === undefined) return null
  return JSON.stringify(body)
}

/**
 * Check if an override with the same method, path, headers, and body already exists
 * @param method - HTTP method
 * @param path - URL path
 * @param headers - Request headers
 * @param body - Request body
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns true if duplicate exists, false otherwise
 */
export async function checkDuplicateOverride(
  method: string,
  path: string,
  headers: Record<string, string> | null,
  body: any | null,
  excludeId?: string
): Promise<boolean> {
  // Normalize path and method
  const normalizedPath = normalizePath(path)
  const normalizedMethod = method.toUpperCase()

  // Normalize headers and body for comparison
  const headersString = normalizeHeadersString(headers)
  const bodyString = normalizeBodyString(body)

  // Get all overrides with matching method and path
  const allOverrides = await prisma.override.findMany({
    where: {
      method: normalizedMethod,
      path: normalizedPath,
    },
  })

  // Check each override for matching headers and body
  for (const override of allOverrides) {
    // Skip the override being updated
    if (excludeId && override.id === excludeId) {
      continue
    }

    // Normalize override headers for comparison
    const overrideHeaders = override.headers ? JSON.parse(override.headers) : null
    const overrideHeadersString = normalizeHeadersString(overrideHeaders)

    // Compare headers
    if (headersString !== overrideHeadersString) {
      continue
    }

    // Compare body
    const overrideBodyString = normalizeBodyString(override.body ? JSON.parse(override.body) : null)
    if (bodyString !== overrideBodyString) {
      continue
    }

    // If we get here, we have a duplicate
    return true
  }

  return false
}
