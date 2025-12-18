import { NextRequest, NextResponse } from 'next/server'
import { getBaseApisFromEnv } from '@/lib/env-config'

// GET - List all base APIs from environment
export async function GET() {
  try {
    const baseApis = getBaseApisFromEnv()

    return NextResponse.json(
      baseApis.map((api, index) => ({
        id: `env-${index}`,
        key: api.key,
        baseUrl: api.baseUrl,
        pathPrefix: null,
        authHeaders: null,
        isDefault: index === 0,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )
  } catch (error) {
    console.error('Error fetching base APIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch base APIs' },
      { status: 500 }
    )
  }
}

// POST - Not supported (APIs are configured via BASE_APIS environment variable)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Base APIs are configured via BASE_APIS environment variable. Cannot create via API.' },
    { status: 405 }
  )
}
