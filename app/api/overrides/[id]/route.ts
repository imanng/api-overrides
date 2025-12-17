import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDuplicateOverride } from '@/lib/validation'
import type { UpdateOverrideInput } from '@/types/override'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a specific override
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const override = await prisma.override.findUnique({
      where: { id },
    })

    if (!override) {
      return NextResponse.json(
        { error: 'Override not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching override:', error)
    return NextResponse.json(
      { error: 'Failed to fetch override' },
      { status: 500 }
    )
  }
}

// PUT - Update an override
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body: UpdateOverrideInput = await request.json()

    // Check if override exists
    const existing = await prisma.override.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Override not found' },
        { status: 404 }
      )
    }

    // Determine the values to check for duplicates
    const methodToCheck = body.method !== undefined ? body.method : existing.method
    const pathToCheck = body.path !== undefined ? body.path : existing.path
    const headersToCheck = body.headers !== undefined 
      ? body.headers 
      : (existing.headers ? JSON.parse(existing.headers) : null)
    const bodyToCheck = body.body !== undefined 
      ? body.body 
      : (existing.body ? JSON.parse(existing.body) : null)

    // Check for duplicate override (excluding current override)
    const isDuplicate = await checkDuplicateOverride(
      methodToCheck,
      pathToCheck,
      headersToCheck,
      bodyToCheck,
      id
    )

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'An override with the same method, path, headers, and body already exists' },
        { status: 409 }
      )
    }

    const updateData: any = {}
    if (body.method !== undefined) updateData.method = body.method.toUpperCase()
    if (body.path !== undefined) updateData.path = body.path
    if (body.headers !== undefined)
      updateData.headers = body.headers ? JSON.stringify(body.headers) : null
    if (body.body !== undefined)
      updateData.body = body.body ? JSON.stringify(body.body) : null
    if (body.status !== undefined) updateData.status = body.status
    if (body.responseBody !== undefined)
      updateData.responseBody = JSON.stringify(body.responseBody)

    const override = await prisma.override.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error updating override:', error)
    return NextResponse.json(
      { error: 'Failed to update override' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an override
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const override = await prisma.override.findUnique({
      where: { id },
    })

    if (!override) {
      return NextResponse.json(
        { error: 'Override not found' },
        { status: 404 }
      )
    }

    await prisma.override.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting override:', error)
    return NextResponse.json(
      { error: 'Failed to delete override' },
      { status: 500 }
    )
  }
}

