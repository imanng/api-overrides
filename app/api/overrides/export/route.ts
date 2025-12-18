import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/get-client-ip'
import { compareIPs } from '@/lib/ip-utils'

// GET - Export all overrides as JSON file
export async function GET(request: NextRequest) {
  try {
    // Get client IP address (normalized)
    const clientIP = getClientIP(request)

    if (!clientIP) {
      return NextResponse.json(
        { error: 'Unable to determine client IP address' },
        { status: 400 }
      )
    }

    // Fetch all overrides and filter by IP (supports both IPv4 and IPv6, handles normalization)
    const allOverrides = await prisma.override.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Filter overrides that match the client's IP address (handles IPv4, IPv6, and normalization)
    const overrides = allOverrides.filter(override => 
      override.ipAddress && compareIPs(override.ipAddress, clientIP)
    )

    // Format overrides for export (exclude internal IDs and timestamps)
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      overrides: overrides.map((override) => ({
        method: override.method,
        path: override.path,
        headers: override.headers ? JSON.parse(override.headers) : null,
        body: override.body ? JSON.parse(override.body) : null,
        status: override.status,
        responseBody: JSON.parse(override.responseBody),
      })),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="api-overrides-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting overrides:', error)
    return NextResponse.json(
      { error: 'Failed to export overrides' },
      { status: 500 }
    )
  }
}
