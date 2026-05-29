const INTERNAL_OVERRIDE_HEADERS = new Set([
  'x-override-client-ip',
  'x-override-proxy-secret',
])

export function isInternalOverrideHeader(headerName: string): boolean {
  return INTERNAL_OVERRIDE_HEADERS.has(headerName.toLowerCase())
}

export function stripInternalOverrideHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const sanitizedHeaders: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (!isInternalOverrideHeader(key)) {
      sanitizedHeaders[key] = value
    }
  }

  return sanitizedHeaders
}
