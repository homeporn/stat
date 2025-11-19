import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, type BuyIn } from '@/lib/db'

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

    const buyInId = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO buy_ins (id, sessionId, playerId, amount, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(buyInId, id, playerId, parseFloat(amount), now)

    const buyIn = db.prepare(`
      SELECT bi.*, p.name as player_name, p.nickname as player_nickname
      FROM buy_ins bi
      JOIN players p ON bi.playerId = p.id
      WHERE bi.id = ?
    `).get(buyInId) as BuyIn & { player_name: string; player_nickname: string | null }

    return NextResponse.json({
      ...buyIn,
      player: {
        id: buyIn.playerId,
        name: buyIn.player_name,
        nickname: buyIn.player_nickname,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating buy-in:', error)
    return NextResponse.json(
      { error: 'Failed to create buy-in', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
