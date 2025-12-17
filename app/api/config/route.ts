import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateApiConfigInput } from '@/types/api'

// GET - Retrieve API configuration
export async function GET() {
  try {
    const config = await prisma.apiConfig.findFirst()

    // If no config exists, return default
    if (!config) {
      return NextResponse.json({
        baseUrl: '',
        authHeaders: null,
        timeout: 30000,
        userKey: null,
      })
    }

    return NextResponse.json({
      id: config.id,
      baseUrl: config.baseUrl,
      authHeaders: config.authHeaders ? JSON.parse(config.authHeaders) : null,
      timeout: config.timeout,
      userKey: config.userKey,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching API config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API configuration' },
      { status: 500 }
    )
  }
}

// PUT - Update or create API configuration
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateApiConfigInput = await request.json()

    // Get existing config or create new one
    let config = await prisma.apiConfig.findFirst()

    const data = {
      baseUrl: body.baseUrl ?? config?.baseUrl ?? '',
      authHeaders: body.authHeaders ? JSON.stringify(body.authHeaders) : null,
      timeout: body.timeout ?? config?.timeout ?? 30000,
    }

    if (config) {
      // Update existing
      config = await prisma.apiConfig.update({
        where: { id: config.id },
        data,
      })
    } else {
      // Create new
      config = await prisma.apiConfig.create({
        data,
      })
    }

    return NextResponse.json({
      id: config.id,
      baseUrl: config.baseUrl,
      authHeaders: config.authHeaders ? JSON.parse(config.authHeaders) : null,
      timeout: config.timeout,
      userKey: config.userKey,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })
  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json(
      { error: 'Failed to update API configuration' },
      { status: 500 }
    )
  }
}

