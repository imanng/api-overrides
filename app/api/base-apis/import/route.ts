import { NextRequest, NextResponse } from 'next/server'

// POST - Import base APIs from JSON file (disabled - use BASE_APIS environment variable instead)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Base APIs are configured via BASE_APIS environment variable. Cannot import via API. Please update your environment variable instead.' },
    { status: 405 }
  )
}
