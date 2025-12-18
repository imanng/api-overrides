import { NextRequest, NextResponse } from 'next/server'
import { getBaseApisFromEnv } from '@/lib/env-config'

// GET - Get a specific base API from environment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const baseApis = getBaseApisFromEnv()
    
    // Extract index from id (format: env-0, env-1, etc.)
    const indexMatch = id.match(/^env-(\d+)$/)
    if (!indexMatch) {
      return NextResponse.json(
        { error: 'Base API not found' },
        { status: 404 }
      )
    }

    const index = parseInt(indexMatch[1], 10)
    if (index < 0 || index >= baseApis.length) {
      return NextResponse.json(
        { error: 'Base API not found' },
        { status: 404 }
      )
    }

    const api = baseApis[index]
    return NextResponse.json({
      id: `env-${index}`,
      key: api.key,
      baseUrl: api.baseUrl,
      pathPrefix: null,
      authHeaders: null,
      isDefault: index === 0,
      order: index,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error fetching base API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch base API' },
      { status: 500 }
    )
  }
}

// PUT - Not supported (APIs are configured via BASE_APIS environment variable)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'Base APIs are configured via BASE_APIS environment variable. Cannot update via API.' },
    { status: 405 }
  )
}

// DELETE - Not supported (APIs are configured via BASE_APIS environment variable)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'Base APIs are configured via BASE_APIS environment variable. Cannot delete via API.' },
    { status: 405 }
  )
}
