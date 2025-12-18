/**
 * Parse BASE_APIS environment variable
 * Format: name1:url1,name2:url2
 */
export interface BaseApiConfig {
  key: string
  baseUrl: string
}

export function getBaseApisFromEnv(): BaseApiConfig[] {
  const baseApisEnv = process.env.BASE_APIS

  if (!baseApisEnv) {
    return []
  }

  const apis: BaseApiConfig[] = []
  const pairs = baseApisEnv.split(',')

  for (const pair of pairs) {
    const trimmed = pair.trim()
    if (!trimmed) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) {
      console.warn(`Invalid BASE_APIS format: "${pair}". Expected format: name:url`)
      continue
    }

    const key = trimmed.substring(0, colonIndex).trim()
    const baseUrl = trimmed.substring(colonIndex + 1).trim()

    if (!key || !baseUrl) {
      console.warn(`Invalid BASE_APIS format: "${pair}". Key and URL must not be empty`)
      continue
    }

    apis.push({ key, baseUrl })
  }

  return apis
}

/**
 * Get a base API by key
 */
export function getBaseApiByKey(key: string): BaseApiConfig | null {
  const apis = getBaseApisFromEnv()
  return apis.find((api) => api.key === key) || null
}

/**
 * Get the first base API (default)
 */
export function getDefaultBaseApi(): BaseApiConfig | null {
  const apis = getBaseApisFromEnv()
  return apis.length > 0 ? apis[0] : null
}
