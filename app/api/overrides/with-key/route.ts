import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all overrides using user key
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userKey = searchParams.get('key')

    if (!userKey) {
      return NextResponse.json(
        { error: 'User key is required' },
        { status: 401 }
      )
    }

    // Verify user key
    const config = await prisma.apiConfig.findFirst()
    
    if (!config || config.userKey !== userKey) {
      return NextResponse.json(
        { error: 'Invalid user key' },
        { status: 403 }
      )
    }

    // Return all overrides
    const overrides = await prisma.override.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      overrides.map((override) => ({
        id: override.id,
        method: override.method,
        path: override.path,
        headers: override.headers ? JSON.parse(override.headers) : null,
        body: override.body ? JSON.parse(override.body) : null,
        status: override.status,
        responseBody: JSON.parse(override.responseBody),
        ipAddress: override.ipAddress,
        createdAt: override.createdAt,
        updatedAt: override.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching overrides with key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overrides' },
      { status: 500 }
    )
  }
}
