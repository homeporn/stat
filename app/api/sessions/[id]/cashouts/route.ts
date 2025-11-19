import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, type CashOut } from '@/lib/db'

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

    const cashOutId = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO cash_outs (id, sessionId, playerId, amount, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(cashOutId, id, playerId, parseFloat(amount), now)

    const cashOut = db.prepare(`
      SELECT co.*, p.name as player_name, p.nickname as player_nickname
      FROM cash_outs co
      JOIN players p ON co.playerId = p.id
      WHERE co.id = ?
    `).get(cashOutId) as CashOut & { player_name: string; player_nickname: string | null }

    return NextResponse.json({
      ...cashOut,
      player: {
        id: cashOut.playerId,
        name: cashOut.player_name,
        nickname: cashOut.player_nickname,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating cash-out:', error)
    return NextResponse.json(
      { error: 'Failed to create cash-out', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
