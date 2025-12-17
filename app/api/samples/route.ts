import { NextResponse } from 'next/server'
import sampleOverrides from '@/mocks/sample-overrides.json'

// GET - Get all sample overrides
export async function GET() {
  try {
    return NextResponse.json(sampleOverrides.overrides)
  } catch (error) {
    console.error('Error fetching samples:', error)
    return NextResponse.json(
      { error: 'Failed to fetch samples' },
      { status: 500 }
    )
  }
}
