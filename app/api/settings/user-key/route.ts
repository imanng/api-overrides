import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// GET - Get or generate user key
export async function GET() {
  try {
    let config = await prisma.apiConfig.findFirst()

    // If no config exists, create one with a user key
    if (!config) {
      const userKey = randomBytes(32).toString('hex')
      config = await prisma.apiConfig.create({
        data: {
          baseUrl: '',
          timeout: 30000,
          userKey,
        },
      })
      return NextResponse.json({ userKey })
    }

    // If config exists but no user key, generate one
    if (!config.userKey) {
      const userKey = randomBytes(32).toString('hex')
      config = await prisma.apiConfig.update({
        where: { id: config.id },
        data: { userKey },
      })
      return NextResponse.json({ userKey })
    }

    return NextResponse.json({ userKey: config.userKey })
  } catch (error) {
    console.error('Error fetching user key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user key' },
      { status: 500 }
    )
  }
}

// POST - Regenerate user key
export async function POST() {
  try {
    const userKey = randomBytes(32).toString('hex')
    
    let config = await prisma.apiConfig.findFirst()
    
    if (config) {
      await prisma.apiConfig.update({
        where: { id: config.id },
        data: { userKey },
      })
    } else {
      await prisma.apiConfig.create({
        data: {
          baseUrl: '',
          timeout: 30000,
          userKey,
        },
      })
    }

    return NextResponse.json({ userKey })
  } catch (error) {
    console.error('Error regenerating user key:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate user key' },
      { status: 500 }
    )
  }
}

// PUT - Set a specific user key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userKey } = body

    if (!userKey || typeof userKey !== 'string') {
      return NextResponse.json(
        { error: 'User key is required' },
        { status: 400 }
      )
    }

    let config = await prisma.apiConfig.findFirst()
    
    if (config) {
      await prisma.apiConfig.update({
        where: { id: config.id },
        data: { userKey },
      })
    } else {
      await prisma.apiConfig.create({
        data: {
          baseUrl: '',
          timeout: 30000,
          userKey,
        },
      })
    }

    return NextResponse.json({ userKey })
  } catch (error) {
    console.error('Error setting user key:', error)
    return NextResponse.json(
      { error: 'Failed to set user key' },
      { status: 500 }
    )
  }
}
