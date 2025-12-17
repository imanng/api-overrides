import { NextResponse } from 'next/server'
import sampleOverrides from '@/mocks/sample-overrides.json'

// GET - Download sample override file
export async function GET() {
  // Update exportedAt timestamp to current time
  const sampleData = {
    ...sampleOverrides,
    exportedAt: new Date().toISOString(),
  }

  return new NextResponse(JSON.stringify(sampleData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="api-overrides-sample.json"',
    },
  })
}
