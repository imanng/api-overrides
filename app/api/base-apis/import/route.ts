import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Import base APIs from JSON file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    let importData: {
      version?: string
      baseApis: Array<{
        key: string
        baseUrl: string
        pathPrefix?: string | null
        authHeaders?: Record<string, string> | null
        isDefault?: boolean
        order?: number
      }>
    }

    try {
      importData = JSON.parse(text)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON file' },
        { status: 400 }
      )
    }

    // Validate structure
    if (!importData.baseApis || !Array.isArray(importData.baseApis)) {
      return NextResponse.json(
        { error: 'Invalid file format: missing baseApis array' },
        { status: 400 }
      )
    }

    // Import base APIs
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    for (const api of importData.baseApis) {
      try {
        // Validate required fields
        if (!api.key || !api.baseUrl) {
          results.errors.push(
            `Skipped base API: missing required fields (key: ${api.key}, baseUrl: ${api.baseUrl})`
          )
          continue
        }

        // If this is set as default, unset other defaults first
        if (api.isDefault) {
          await prisma.baseApi.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
          })
        }

        // Check if base API with this key already exists
        const existing = await prisma.baseApi.findUnique({
          where: { key: api.key },
        })

        if (existing) {
          // Update existing base API
          await prisma.baseApi.update({
            where: { key: api.key },
            data: {
              baseUrl: api.baseUrl,
              pathPrefix: api.pathPrefix ?? null,
              authHeaders: api.authHeaders ? JSON.stringify(api.authHeaders) : null,
              isDefault: api.isDefault ?? false,
              order: api.order ?? existing.order,
            },
          })
          results.updated++
        } else {
          // Create new base API
          await prisma.baseApi.create({
            data: {
              key: api.key,
              baseUrl: api.baseUrl,
              pathPrefix: api.pathPrefix ?? null,
              authHeaders: api.authHeaders ? JSON.stringify(api.authHeaders) : null,
              isDefault: api.isDefault ?? false,
              order: api.order ?? 0,
            },
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(
          `Failed to import base API ${api.key}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.created} base API(s), updated ${results.updated} base API(s)`,
      ...results,
    })
  } catch (error) {
    console.error('Error importing base APIs:', error)
    return NextResponse.json(
      { error: 'Failed to import base APIs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
