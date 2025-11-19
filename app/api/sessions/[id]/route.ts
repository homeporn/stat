import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await prisma.session.findUnique({
      where: { id },
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

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, description, playerIds } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Update session
    await prisma.session.update({
      where: { id },
      data: {
        date: new Date(date),
        description: description?.trim() || null,
      },
    })

    // Update players
    if (playerIds && Array.isArray(playerIds)) {
      // Delete existing session players
      await prisma.sessionPlayer.deleteMany({
        where: { sessionId: id },
      })

      // Create new session players
      await prisma.sessionPlayer.createMany({
        data: playerIds.map((playerId: string) => ({
          sessionId: id,
          playerId,
        })),
      })
    }

    const session = await prisma.session.findUnique({
      where: { id },
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

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

