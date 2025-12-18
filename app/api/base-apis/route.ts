import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateBaseApiInput, UpdateBaseApiInput } from '@/types/api'

// GET - List all base APIs
export async function GET() {
  try {
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
    console.error('Error fetching base APIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch base APIs' },
      { status: 500 }
    )
  }
}

// POST - Create a new base API
export async function POST(request: NextRequest) {
  try {
    const body: CreateBaseApiInput = await request.json()

    if (!body.key || !body.baseUrl) {
      return NextResponse.json(
        { error: 'Key and baseUrl are required' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await prisma.baseApi.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    // Ensure key is a non-empty string
    const keyValue = (body.key || '').trim()
    if (!keyValue) {
      return NextResponse.json(
        { error: 'Key cannot be empty' },
        { status: 400 }
      )
    }

    const baseApi = await prisma.baseApi.create({
      data: {
        key: keyValue,
        baseUrl: body.baseUrl,
        pathPrefix: body.pathPrefix ?? null,
        authHeaders: body.authHeaders ? JSON.stringify(body.authHeaders) : null,
        isDefault: body.isDefault ?? false,
        order: body.order ?? 0,
      },
    })

    return NextResponse.json({
      id: baseApi.id,
      key: baseApi.key,
      baseUrl: baseApi.baseUrl,
      pathPrefix: baseApi.pathPrefix,
      authHeaders: baseApi.authHeaders ? JSON.parse(baseApi.authHeaders) : null,
      isDefault: baseApi.isDefault,
      order: baseApi.order,
      createdAt: baseApi.createdAt,
      updatedAt: baseApi.updatedAt,
    })
  } catch (error) {
    console.error('Error creating base API:', error)
    return NextResponse.json(
      { error: 'Failed to create base API' },
      { status: 500 }
    )
  }
}
