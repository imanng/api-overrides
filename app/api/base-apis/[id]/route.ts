import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateBaseApiInput } from '@/types/api'

// GET - Get a specific base API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const baseApi = await prisma.baseApi.findUnique({
      where: { id },
    })

    if (!baseApi) {
      return NextResponse.json(
        { error: 'Base API not found' },
        { status: 404 }
      )
    }

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
    console.error('Error fetching base API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch base API' },
      { status: 500 }
    )
  }
}

// PUT - Update a base API
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateBaseApiInput = await request.json()

    const existing = await prisma.baseApi.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Base API not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await prisma.baseApi.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const updateData: any = {}
    if (body.key !== undefined) updateData.key = body.key
    if (body.baseUrl !== undefined) updateData.baseUrl = body.baseUrl
    if (body.pathPrefix !== undefined) updateData.pathPrefix = body.pathPrefix
    if (body.authHeaders !== undefined) {
      updateData.authHeaders = body.authHeaders
        ? JSON.stringify(body.authHeaders)
        : null
    }
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault
    if (body.order !== undefined) updateData.order = body.order

    const baseApi = await prisma.baseApi.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating base API:', error)
    return NextResponse.json(
      { error: 'Failed to update base API' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a base API
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.baseApi.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Base API not found' },
        { status: 404 }
      )
    }

    await prisma.baseApi.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting base API:', error)
    return NextResponse.json(
      { error: 'Failed to delete base API' },
      { status: 500 }
    )
  }
}
