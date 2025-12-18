import { NextRequest, NextResponse } from 'next/server'
import { getBaseApisFromEnv } from '@/lib/env-config'
import { prisma } from '@/lib/prisma'

// GET - Get all base APIs using user key
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

    // Verify user key (still check from database for backward compatibility)
    const config = await prisma.apiConfig.findFirst()
    
    if (!config || config.userKey !== userKey) {
      return NextResponse.json(
        { error: 'Invalid user key' },
        { status: 403 }
      )
    }

    // Return all base APIs from environment
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
    console.error('Error fetching base APIs with key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch base APIs' },
      { status: 500 }
    )
  }
}
