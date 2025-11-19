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

    const cashOut = await prisma.cashOut.create({
      data: {
        sessionId: id,
        playerId,
        amount: parseFloat(amount),
      },
      include: {
        player: true,
      },
    })

    return NextResponse.json(cashOut, { status: 201 })
  } catch (error) {
    console.error('Error creating cash-out:', error)
    return NextResponse.json(
      { error: 'Failed to create cash-out' },
      { status: 500 }
    )
  }
}

