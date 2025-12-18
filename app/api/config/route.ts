import { NextRequest, NextResponse } from 'next/server'

// GET - Retrieve API configuration (read-only, from environment)
export async function GET() {
  try {
    // API configuration is now read-only and comes from environment
    return NextResponse.json({
      baseUrl: '',
      authHeaders: null,
      timeout: 30000,
      userKey: null,
      message: 'API configuration is now managed via BASE_APIS environment variable',
    })
  } catch (error) {
    console.error('Error fetching API config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API configuration' },
      { status: 500 }
    )
  }
}

// PUT - Not supported (APIs are configured via BASE_APIS environment variable)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'API configuration is now managed via BASE_APIS environment variable. Cannot update via API.' },
    { status: 405 }
  )
}

