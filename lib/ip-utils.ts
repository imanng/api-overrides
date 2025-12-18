/**
 * Normalize IP addresses for comparison
 * Handles IPv4, IPv6, and IPv4-mapped IPv6 addresses
 */

/**
 * Normalize an IPv6 address to its canonical form
 * Expands compressed notation (::) and removes leading zeros
 */
function normalizeIPv6(ip: string): string {
  // Remove brackets if present (e.g., [2001:db8::1])
  let cleanIP = ip.replace(/^\[|\]$/g, '')
  
  // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1 or ::ffff:0:192.168.1.1)
  const ipv4MappedPatterns = [
    /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i,
    /^::ffff:0:(\d+\.\d+\.\d+\.\d+)$/i,
    /^0:0:0:0:0:ffff:(\d+\.\d+\.\d+\.\d+)$/i,
    /^0000:0000:0000:0000:0000:ffff:(\d+\.\d+\.\d+\.\d+)$/i,
  ]
  
  for (const pattern of ipv4MappedPatterns) {
    const match = cleanIP.match(pattern)
    if (match) {
      // Normalize the IPv4 part
      return normalizeIPv4(match[1])
    }
  }
  
  // Handle IPv4 embedded in IPv6 (last 32 bits as IPv4, e.g., 2001:db8::192.168.1.1)
  // This is less common but we'll normalize it to full IPv6 format
  const ipv4EmbeddedMatch = cleanIP.match(/^(.+):(\d+\.\d+\.\d+\.\d+)$/i)
  if (ipv4EmbeddedMatch) {
    const ipv6Part = ipv4EmbeddedMatch[1]
    const ipv4Part = ipv4EmbeddedMatch[2]
    
    // Check if this is a valid IPv4
    if (isIPv4(ipv4Part)) {
      // Convert IPv4 to hex format (e.g., 192.168.1.1 -> c0a8:0101)
      const ipv4Parts = ipv4Part.split('.')
      const hex1 = parseInt(ipv4Parts[0], 10).toString(16).padStart(2, '0')
      const hex2 = parseInt(ipv4Parts[1], 10).toString(16).padStart(2, '0')
      const hex3 = parseInt(ipv4Parts[2], 10).toString(16).padStart(2, '0')
      const hex4 = parseInt(ipv4Parts[3], 10).toString(16).padStart(2, '0')
      const ipv4Hex = `${hex1}${hex2}:${hex3}${hex4}`
      
      // Replace IPv4 with hex and continue normalization
      cleanIP = ipv6Part + ':' + ipv4Hex
    }
  }
  
  // Split by ::
  const parts = cleanIP.split('::')
  
  if (parts.length === 2) {
    // Has compressed notation
    const left = parts[0] ? parts[0].split(':').filter(p => p) : []
    const right = parts[1] ? parts[1].split(':').filter(p => p) : []
    const totalParts = 8
    const missingParts = totalParts - left.length - right.length
    
    if (missingParts < 0) {
      // Invalid IPv6, return as-is
      return cleanIP.toLowerCase()
    }
    
    // Reconstruct full address
    const fullParts: string[] = []
    
    // Add left parts
    for (const part of left) {
      fullParts.push(part.padStart(4, '0'))
    }
    
    // Add zero parts for compression
    for (let i = 0; i < missingParts; i++) {
      fullParts.push('0000')
    }
    
    // Add right parts
    for (const part of right) {
      fullParts.push(part.padStart(4, '0'))
    }
    
    return fullParts.join(':').toLowerCase()
  } else if (parts.length === 1) {
    // No compression, just normalize each part
    const partsArray = cleanIP.split(':').filter(p => p)
    if (partsArray.length === 8) {
      return partsArray.map(part => part.padStart(4, '0')).join(':').toLowerCase()
    }
    // Invalid format, return as-is
    return cleanIP.toLowerCase()
  } else {
    // Multiple :: found, invalid format
    return cleanIP.toLowerCase()
  }
}

/**
 * Normalize an IPv4 address
 * Just ensures it's in standard format (no leading zeros in octets)
 */
function normalizeIPv4(ip: string): string {
  const parts = ip.split('.')
  if (parts.length !== 4) {
    return ip // Return as-is if invalid format
  }
  
  return parts.map(part => {
    const num = parseInt(part, 10)
    return isNaN(num) ? part : num.toString()
  }).join('.')
}

/**
 * Check if a string is an IPv4 address
 */
function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(ip)) {
    return false
  }
  
  const parts = ip.split('.')
  return parts.every(part => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255
  })
}

/**
 * Check if a string is an IPv6 address
 */
function isIPv6(ip: string): boolean {
  // Remove brackets if present
  const cleanIP = ip.replace(/^\[|\]$/g, '')
  
  // Check for IPv4-mapped IPv6
  if (cleanIP.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i) || 
      cleanIP.match(/^::ffff:0:(\d+\.\d+\.\d+\.\d+)$/i)) {
    return true
  }
  
  // Check for IPv4 embedded in IPv6 (last 32 bits)
  if (cleanIP.includes(':') && cleanIP.match(/:\d+\.\d+\.\d+\.\d+$/)) {
    return true
  }
  
  // Check for standard IPv6 format (with or without compression)
  // Allow 1-8 hex parts separated by colons, with optional :: compression
  const ipv6Regex = /^([0-9a-f]{0,4}:){1,7}[0-9a-f]{0,4}$/i
  const hasCompression = cleanIP.includes('::')
  const colonCount = (cleanIP.match(/:/g) || []).length
  
  // Valid IPv6 should have 2-7 colons (without compression) or :: (with compression)
  if (hasCompression) {
    // With compression, should have at least 2 colons (::) and at most 7
    return colonCount >= 2 && colonCount <= 7 && ipv6Regex.test(cleanIP.replace('::', ':'))
  } else {
    // Without compression, should have exactly 7 colons
    return colonCount === 7 && ipv6Regex.test(cleanIP)
  }
}

/**
 * Normalize an IP address for consistent comparison
 * Returns the normalized IP or null if invalid
 */
export function normalizeIP(ip: string | null): string | null {
  if (!ip) {
    return null
  }
  
  const trimmed = ip.trim()
  
  if (!trimmed) {
    return null
  }
  
  // Try IPv4 first
  if (isIPv4(trimmed)) {
    return normalizeIPv4(trimmed)
  }
  
  // Try IPv6
  if (isIPv6(trimmed)) {
    return normalizeIPv6(trimmed)
  }
  
  // If neither, return as-is (might be a hostname or invalid)
  return trimmed
}

/**
 * Compare two IP addresses for equality
 * Handles IPv4, IPv6, and IPv4-mapped IPv6
 */
export function compareIPs(ip1: string | null, ip2: string | null): boolean {
  if (!ip1 || !ip2) {
    return ip1 === ip2 // Both null/empty = equal, otherwise not equal
  }
  
  const normalized1 = normalizeIP(ip1)
  const normalized2 = normalizeIP(ip2)
  
  if (!normalized1 || !normalized2) {
    return ip1 === ip2 // Fallback to exact match if normalization fails
  }
  
  return normalized1 === normalized2
}
