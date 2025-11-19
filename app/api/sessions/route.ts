import { NextRequest, NextResponse } from 'next/server'
import { db, generateId, type Session, type SessionPlayer, type BuyIn, type CashOut } from '@/lib/db'

export async function GET() {
  try {
    const sessions = db.prepare(`
      SELECT * FROM sessions 
      ORDER BY date DESC
    `).all() as Session[]

    // Get players, buy-ins, and cash-outs for each session
    const sessionsWithData = sessions.map(session => {
      const players = db.prepare(`
        SELECT sp.*, p.* 
        FROM session_players sp
        JOIN players p ON sp.playerId = p.id
        WHERE sp.sessionId = ?
      `).all(session.id) as Array<SessionPlayer & { name: string; nickname: string | null }>

      const buyIns = db.prepare(`
        SELECT bi.*, p.name as player_name, p.nickname as player_nickname
        FROM buy_ins bi
        JOIN players p ON bi.playerId = p.id
        WHERE bi.sessionId = ?
      `).all(session.id) as Array<BuyIn & { player_name: string; player_nickname: string | null }>

      const cashOuts = db.prepare(`
        SELECT co.*, p.name as player_name, p.nickname as player_nickname
        FROM cash_outs co
        JOIN players p ON co.playerId = p.id
        WHERE co.sessionId = ?
      `).all(session.id) as Array<CashOut & { player_name: string; player_nickname: string | null }>

      return {
        ...session,
        players: players.map(sp => ({
          id: sp.id,
          player: {
            id: sp.playerId,
            name: sp.name,
            nickname: sp.nickname,
          },
        })),
        buyIns: buyIns.map(bi => ({
          ...bi,
          player: {
            id: bi.playerId,
            name: bi.player_name,
            nickname: bi.player_nickname,
          },
        })),
        cashOuts: cashOuts.map(co => ({
          ...co,
          player: {
            id: co.playerId,
            name: co.player_name,
            nickname: co.player_nickname,
          },
        })),
      }
    })

    return NextResponse.json(sessionsWithData)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const sessionId = generateId()
    const now = new Date().toISOString()

    // Create session
    db.prepare(`
      INSERT INTO sessions (id, date, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, date, description?.trim() || null, now, now)

    // Add players to session
    const insertSessionPlayer = db.prepare(`
      INSERT INTO session_players (id, sessionId, playerId)
      VALUES (?, ?, ?)
    `)

    for (const playerId of playerIds) {
      insertSessionPlayer.run(generateId(), sessionId, playerId)
    }

    // Get created session with players
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session
    const players = db.prepare(`
      SELECT sp.*, p.* 
      FROM session_players sp
      JOIN players p ON sp.playerId = p.id
      WHERE sp.sessionId = ?
    `).all(sessionId)

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
      buyIns: [],
      cashOuts: [],
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
