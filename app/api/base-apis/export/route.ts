import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Export all base APIs as JSON file
export async function GET() {
  try {
    const baseApis = await prisma.baseApi.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    // Format base APIs for export (exclude internal IDs and timestamps)
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      baseApis: baseApis.map((api) => ({
        key: api.key,
        baseUrl: api.baseUrl,
        pathPrefix: api.pathPrefix,
        authHeaders: api.authHeaders ? JSON.parse(api.authHeaders) : null,
        isDefault: api.isDefault,
        order: api.order,
      })),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="base-apis-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting base APIs:', error)
    return NextResponse.json(
      { error: 'Failed to export base APIs' },
      { status: 500 }
    )
  }
}
