import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { playerId, amount } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const buyIn = await prisma.buyIn.create({
      data: {
        sessionId: id,
        playerId,
        amount: parseFloat(amount),
      },
      include: {
        player: true,
      },
    })

    return NextResponse.json(buyIn, { status: 201 })
  } catch (error) {
    console.error('Error creating buy-in:', error)
    return NextResponse.json(
      { error: 'Failed to create buy-in' },
      { status: 500 }
    )
  }
}

