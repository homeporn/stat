import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, type Session } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const players = db.prepare(`
      SELECT sp.*, p.* 
      FROM session_players sp
      JOIN players p ON sp.playerId = p.id
      WHERE sp.sessionId = ?
    `).all(id)

    const buyIns = db.prepare(`
      SELECT bi.*, p.name as player_name, p.nickname as player_nickname
      FROM buy_ins bi
      JOIN players p ON bi.playerId = p.id
      WHERE bi.sessionId = ?
    `).all(id)

    const cashOuts = db.prepare(`
      SELECT co.*, p.name as player_name, p.nickname as player_nickname
      FROM cash_outs co
      JOIN players p ON co.playerId = p.id
      WHERE co.sessionId = ?
    `).all(id)

    return NextResponse.json({
      ...session,
      players: players.map((sp: any) => ({
        id: sp.id,
        player: {
          id: sp.playerId,
          name: sp.name,
          nickname: sp.nickname,
        },
      })),
      buyIns: buyIns.map((bi: any) => ({
        ...bi,
        player: {
          id: bi.playerId,
          name: bi.player_name,
          nickname: bi.player_nickname,
        },
      })),
      cashOuts: cashOuts.map((co: any) => ({
        ...co,
        player: {
          id: co.playerId,
          name: co.player_name,
          nickname: co.player_nickname,
        },
      })),
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const now = new Date().toISOString()

    // Update session
    db.prepare(`
      UPDATE sessions 
      SET date = ?, description = ?, updatedAt = ?
      WHERE id = ?
    `).run(date, description?.trim() || null, now, id)

    // Update players if provided
    if (playerIds && Array.isArray(playerIds)) {
      // Delete existing session players
      db.prepare('DELETE FROM session_players WHERE sessionId = ?').run(id)

      // Add new session players
      const insertSessionPlayer = db.prepare(`
        INSERT INTO session_players (id, sessionId, playerId)
        VALUES (?, ?, ?)
      `)

      for (const playerId of playerIds) {
        insertSessionPlayer.run(generateId(), id, playerId)
      }
    }

    // Get updated session
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session
    const players = db.prepare(`
      SELECT sp.*, p.* 
      FROM session_players sp
      JOIN players p ON sp.playerId = p.id
      WHERE sp.sessionId = ?
    `).all(id)

    const buyIns = db.prepare(`
      SELECT bi.*, p.name as player_name, p.nickname as player_nickname
      FROM buy_ins bi
      JOIN players p ON bi.playerId = p.id
      WHERE bi.sessionId = ?
    `).all(id)

    const cashOuts = db.prepare(`
      SELECT co.*, p.name as player_name, p.nickname as player_nickname
      FROM cash_outs co
      JOIN players p ON co.playerId = p.id
      WHERE co.sessionId = ?
    `).all(id)

    return NextResponse.json({
      ...session,
      players: players.map((sp: any) => ({
        id: sp.id,
        player: {
          id: sp.playerId,
          name: sp.name,
          nickname: sp.nickname,
        },
      })),
      buyIns: buyIns.map((bi: any) => ({
        ...bi,
        player: {
          id: bi.playerId,
          name: bi.player_name,
          nickname: bi.player_nickname,
        },
      })),
      cashOuts: cashOuts.map((co: any) => ({
        ...co,
        player: {
          id: co.playerId,
          name: co.player_name,
          nickname: co.player_nickname,
        },
      })),
    })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session', details: error instanceof Error ? error.message : 'Unknown error' },
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
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
