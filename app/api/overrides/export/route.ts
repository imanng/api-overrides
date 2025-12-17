import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Export all overrides as JSON file
export async function GET() {
  try {
    const overrides = await prisma.override.findMany({
      orderBy: { createdAt: 'desc' },
    })

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
