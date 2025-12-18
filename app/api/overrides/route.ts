import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDuplicateOverride } from '@/lib/validation'
import { getClientIP } from '@/lib/get-client-ip'
import type { CreateOverrideInput } from '@/types/override'

// GET - List all overrides
export async function GET() {
  try {
    const overrides = await prisma.override.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      overrides.map((override: { id: string; method: string; path: string; headers: string | null; body: string | null; status: number; responseBody: string; ipAddress: string | null; baseApiId: string | null; createdAt: Date; updatedAt: Date }) => ({
        id: override.id,
        method: override.method,
        path: override.path,
        headers: override.headers ? JSON.parse(override.headers) : null,
        body: override.body ? JSON.parse(override.body) : null,
        status: override.status,
        responseBody: JSON.parse(override.responseBody),
        ipAddress: override.ipAddress,
        baseApiId: override.baseApiId,
        createdAt: override.createdAt,
        updatedAt: override.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching overrides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overrides' },
      { status: 500 }
    )
  }
}

// POST - Create a new override
export async function POST(request: NextRequest) {
  try {
    const body: CreateOverrideInput = await request.json()

    // Validate required fields
    if (!body.method || !body.path || !body.responseBody) {
      return NextResponse.json(
        { error: 'Method, path, and responseBody are required' },
        { status: 400 }
      )
    }

    // Check for duplicate override
    const isDuplicate = await checkDuplicateOverride(
      body.method,
      body.path,
      body.headers || null,
      body.body || null
    )

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'An override with the same method, path, headers, and body already exists' },
        { status: 409 }
      )
    }

    // Get client IP address
    const clientIP = getClientIP(request)

    const override = await prisma.override.create({
      data: {
        method: body.method.toUpperCase(),
        path: body.path,
        headers: body.headers ? JSON.stringify(body.headers) : null,
        body: body.body ? JSON.stringify(body.body) : null,
        status: body.status ?? 200,
        responseBody: JSON.stringify(body.responseBody),
        ipAddress: clientIP,
        baseApiId: body.baseApiId || null,
      },
    })

    return NextResponse.json(
      {
        id: override.id,
        method: override.method,
        path: override.path,
        headers: override.headers ? JSON.parse(override.headers) : null,
        body: override.body ? JSON.parse(override.body) : null,
        status: override.status,
        responseBody: JSON.parse(override.responseBody),
        ipAddress: override.ipAddress,
        baseApiId: override.baseApiId,
        createdAt: override.createdAt,
        updatedAt: override.updatedAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating override:', error)
    return NextResponse.json(
      { error: 'Failed to create override' },
      { status: 500 }
    )
  }
}

