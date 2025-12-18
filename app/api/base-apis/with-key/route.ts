import { NextRequest, NextResponse } from 'next/server'
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

    // Verify user key
    const config = await prisma.apiConfig.findFirst()
    
    if (!config || config.userKey !== userKey) {
      return NextResponse.json(
        { error: 'Invalid user key' },
        { status: 403 }
      )
    }

    // Return all base APIs
    const baseApis = await prisma.baseApi.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(
      baseApis.map((api) => ({
        id: api.id,
        key: api.key,
        baseUrl: api.baseUrl,
        pathPrefix: api.pathPrefix,
        authHeaders: api.authHeaders ? JSON.parse(api.authHeaders) : null,
        isDefault: api.isDefault,
        order: api.order,
        createdAt: api.createdAt,
        updatedAt: api.updatedAt,
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
