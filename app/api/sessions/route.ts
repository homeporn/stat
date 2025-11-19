import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: 'desc' },
      include: {
        players: {
          include: {
            player: true,
          },
        },
        buyIns: {
          include: {
            player: true,
          },
        },
        cashOuts: {
          include: {
            player: true,
          },
        },
      },
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, description, playerIds } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one player is required' },
        { status: 400 }
      )
    }

    const session = await prisma.session.create({
      data: {
        date: new Date(date),
        description: description?.trim() || null,
        players: {
          create: playerIds.map((playerId: string) => ({
            playerId,
          })),
        },
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

