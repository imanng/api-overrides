import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/get-client-ip'

// POST - Import overrides from JSON file
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
      overrides: Array<{
        method: string
        path: string
        headers?: Record<string, string> | null
        body?: any | null
        status?: number
        responseBody: any
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
    if (!importData.overrides || !Array.isArray(importData.overrides)) {
      return NextResponse.json(
        { error: 'Invalid file format: missing overrides array' },
        { status: 400 }
      )
    }

    // Import overrides
    const results = {
      created: 0,
      errors: [] as string[],
    }

    // Get client IP address for all imported overrides
    const clientIP = getClientIP(request)

    for (const override of importData.overrides) {
      try {
        // Validate required fields
        if (!override.method || !override.path || override.responseBody === undefined) {
          results.errors.push(
            `Skipped override: missing required fields (method: ${override.method}, path: ${override.path})`
          )
          continue
        }

        // Create override
        await prisma.override.create({
          data: {
            method: override.method.toUpperCase(),
            path: override.path,
            headers: override.headers ? JSON.stringify(override.headers) : null,
            body: override.body ? JSON.stringify(override.body) : null,
            status: override.status ?? 200,
            responseBody: JSON.stringify(override.responseBody),
            ipAddress: clientIP,
          },
        })

        results.created++
      } catch (error) {
        results.errors.push(
          `Failed to import override ${override.method} ${override.path}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.created} override(s)`,
      ...results,
    })
  } catch (error) {
    console.error('Error importing overrides:', error)
    return NextResponse.json(
      { error: 'Failed to import overrides', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
